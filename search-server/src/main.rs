mod entry;
mod helpers;
mod mutation;
mod query;
mod start;

use actix_cors::Cors;
use actix_web::{
    delete, dev::ServiceRequest, get, middleware::Logger, post, web, App, HttpResponse, HttpServer,
};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};
use cached::proc_macro::cached;
use dotenv;
use entry::Entry;
use env_logger::Env;
use helpers::*;
use meilisearch_sdk::{client::*, progress::*, search::*};
use mutation::*;
use query::*;
use serde::{Deserialize, Serialize};
use start::{check_meilisearch, start_meilisearch};
use std::env;
use std::io::Result;
use std::sync::{Arc, Mutex};
use uuid::Uuid;

impl QueryResponse<Entry> {
    fn new(results: SearchResults<Entry>) -> Self {
        let hits = results
            .hits
            .iter()
            .map(|x| x.result.clone())
            .collect::<Vec<Entry>>();

        Self {
            hits,
            processing_time_ms: results.processing_time_ms,
            offset: results.offset,
            limit: results.limit,
            nb_hits: results.nb_hits,
            exhaustive_nb_hits: results.exhaustive_nb_hits,
        }
    }
}

#[derive(Serialize, Deserialize)]
struct ErrorResponse {
    reason: String,
}

#[derive(Serialize)]
struct StatusResponse {
    update_id: u64,
    state: String,
}

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    server_status: String,
    meilie_health: bool,
}

struct AppState<'a> {
    client: Arc<Mutex<Client<'a>>>,
    index_name: &'a str,
}

#[cached(size = 1, time = 120)]
async fn verify_token(token: String) -> bool {
    let web_client = actix_web::client::Client::default();

    let key = "AUTH0_ISSUER_BASE_URL";

    match env::var(key) {
        Ok(url) => {
            let endpoint = format!("{}/userinfo", url);
            let res = web_client
                .get(endpoint)
                .header("Authorization", format!("Bearer {}", token))
                .send()
                .await;

            let status = res.unwrap().status();
            status == 200
        }
        Err(_) => false,
    }
}

async fn validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> actix_web::Result<ServiceRequest, actix_web::Error> {
    let token = credentials.token();
    let is_valid = verify_token(token.to_owned()).await;

    if is_valid {
        return Ok(req);
    }

    return Err(actix_web::error::ErrorUnauthorized("Error"));
}

#[get("/later_than")]
async fn later_than<'a>(
    info: web::Query<FromQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => {
            let filter = format!("created_at >= {}", info.created_at);

            let mut response = match (info.offset, info.limit) {
                (Some(offset), Some(limit)) => index
                    .search()
                    .with_offset(offset)
                    .with_limit(limit)
                    .with_filters(&filter)
                    .execute()
                    .await
                    .unwrap_or(SearchResults::<Entry> {
                        hits: vec![],
                        offset: 0,
                        limit: 20,
                        nb_hits: 0,
                        exhaustive_nb_hits: false,
                        facets_distribution: None,
                        exhaustive_facets_count: None,
                        processing_time_ms: 0,
                        query: "".to_string(),
                    }),
                _ => {
                    let mut offset = 0;
                    let mut limit = 100;

                    let mut results: SearchResults<Entry> = index
                        .search()
                        .with_filters(&filter)
                        .with_offset(offset)
                        .with_limit(limit)
                        .execute()
                        .await
                        .unwrap_or(SearchResults::<Entry> {
                            hits: vec![],
                            offset: 0,
                            limit: 20,
                            nb_hits: 0,
                            exhaustive_nb_hits: false,
                            facets_distribution: None,
                            exhaustive_facets_count: None,
                            processing_time_ms: 0,
                            query: "".to_string(),
                        });

                    loop {
                        offset = limit;
                        limit += 100;

                        let next: SearchResults<Entry> = index
                            .search()
                            .with_filters(&filter)
                            .with_offset(offset)
                            .with_limit(limit)
                            .execute()
                            .await
                            .unwrap_or(SearchResults::<Entry> {
                                hits: vec![],
                                offset: 0,
                                limit: 20,
                                nb_hits: 0,
                                exhaustive_nb_hits: false,
                                facets_distribution: None,
                                exhaustive_facets_count: None,
                                processing_time_ms: 0,
                                query: "".to_string(),
                            });

                        if next.hits.len() == 0 {
                            break;
                        }

                        for hit in next.hits {
                            results.hits.push(hit);
                        }

                        results.processing_time_ms += next.processing_time_ms;
                    }

                    results
                }
            };

            response
                .hits
                .sort_by(|a, b| a.result.created_at.cmp(&b.result.created_at).reverse());

            Ok(HttpResponse::Ok().json(QueryResponse::new(response)))
        }

        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[get("/bulk")]
async fn bulk<'a>(
    info: web::Query<BulkQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => match index.get_documents::<Entry>(None, info.qty, None).await {
            Ok(all) => Ok(HttpResponse::Ok().json(all)),
            Err(_) => Ok(HttpResponse::NotFound().json(ErrorResponse {
                reason: format!("No documents found"),
            })),
        },

        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[get("/search")]
async fn search<'a>(
    info: web::Query<SearchQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;

    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => match index.search().with_query(&info.0.q).execute().await {
            Ok(results) => Ok(HttpResponse::Ok().json(QueryResponse::new(results))),
            Err(_) => Ok(HttpResponse::NotFound().json(ErrorResponse {
                reason: format!("Nothing found"),
            })),
        },
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/create")]
async fn create<'a>(
    info: web::Json<CreateEntry>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => {
            let created_at = get_current_time_secs();
            let uuid = Uuid::new_v4();
            let entry = Entry {
                id: uuid.to_hyphenated().to_string(),
                title: info.title.clone(),
                description: info.description.clone(),
                created_at,
                organization: info.organization.clone(),
                privacy: if info.privacy.is_none() { false } else { true },
                links: vec![],
                tags: vec![],
                images: vec![],
            };

            match index.add_or_replace(&[entry], None).await {
                Ok(progress) => match progress.get_status().await {
                    Ok(status) => {
                        let response = match status {
                            UpdateStatus::Enqueued { content } => StatusResponse {
                                update_id: content.update_id,
                                state: format!("processing"),
                            },
                            UpdateStatus::Failed { content } => StatusResponse {
                                update_id: content.update_id,
                                state: format!("failed"),
                            },
                            UpdateStatus::Processed { content } => StatusResponse {
                                update_id: content.update_id,
                                state: format!("done"),
                            },
                        };

                        Ok(HttpResponse::Ok().json(response))
                    }
                    Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                        reason: format!("Unable to get update status"),
                    })),
                },
                Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                    reason: format!("Failed to create document"),
                })),
            }
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/edit")]
async fn edit<'a>(
    info: web::Json<EditEntry>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => {
            let current_id = info.get_id();
            match index.get_document::<Entry>(current_id).await {
                Ok(current) => {
                    let entry = Entry {
                        id: info.get_id(),
                        created_at: current.created_at,
                        title: match &info.title {
                            Some(val) => val.to_string(),
                            None => current.title,
                        },
                        description: match &info.description {
                            Some(val) => val.to_string(),
                            None => current.description,
                        },

                        organization: match &info.organization {
                            Some(val) => Some(val.to_string()),
                            None => current.organization,
                        },

                        privacy: match &info.privacy {
                            Some(val) => *val,
                            None => current.privacy,
                        },

                        links: vec![],
                        tags: vec![],
                        images: vec![],
                    };

                    match index.add_or_update(&[entry], None).await {
                        Ok(progress) => match progress.get_status().await {
                            Ok(status) => {
                                let response = match status {
                                    UpdateStatus::Enqueued { content } => StatusResponse {
                                        update_id: content.update_id,
                                        state: format!("processing"),
                                    },
                                    UpdateStatus::Failed { content } => StatusResponse {
                                        update_id: content.update_id,
                                        state: format!("failed"),
                                    },
                                    UpdateStatus::Processed { content } => StatusResponse {
                                        update_id: content.update_id,
                                        state: format!("done"),
                                    },
                                };

                                Ok(HttpResponse::Ok().json(response))
                            }
                            Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                                reason: format!("Unable to get update status"),
                            })),
                        },
                        Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                            reason: format!("Failed to create document"),
                        })),
                    }
                }
                Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                    reason: format!("Failed to create document"),
                })),
            }
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[delete("/delete/{id}")]
async fn delete<'a>(
    path: web::Path<(String,)>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let to_delete = path.into_inner().0;
    let c_to_delete = to_delete.clone();

    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => match index.delete_document(to_delete).await {
            Ok(progress) => match progress.get_status().await {
                Ok(status) => {
                    let response = match status {
                        UpdateStatus::Enqueued { content } => StatusResponse {
                            update_id: content.update_id,
                            state: format!("processing"),
                        },
                        UpdateStatus::Failed { content } => StatusResponse {
                            update_id: content.update_id,
                            state: format!("failed"),
                        },
                        UpdateStatus::Processed { content } => StatusResponse {
                            update_id: content.update_id,
                            state: format!("done"),
                        },
                    };
                    Ok(HttpResponse::Ok().json(response))
                }
                Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                    reason: format!("Unable to get update status"),
                })),
            },
            Err(_) => Ok(HttpResponse::NotFound().json(ErrorResponse {
                reason: format!("Nothing to delete. Document id: {}", c_to_delete),
            })),
        },
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[get("/check_update")]
async fn check_update<'a>(
    info: web::Query<UpdateQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => match index.get_all_updates().await {
            Ok(all_updates) => {
                let update_id = info.update_id;

                let status = all_updates.iter().find(|obj| match obj {
                    UpdateStatus::Enqueued { content } => content.update_id == update_id,
                    UpdateStatus::Failed { content } => content.update_id == update_id,
                    UpdateStatus::Processed { content } => content.update_id == update_id,
                });

                let response = match status {
                    Some(UpdateStatus::Enqueued { content }) => StatusResponse {
                        update_id: content.update_id,
                        state: format!("processing"),
                    },
                    Some(UpdateStatus::Failed { content }) => StatusResponse {
                        update_id: content.update_id,
                        state: format!("failed"),
                    },
                    Some(UpdateStatus::Processed { content }) => StatusResponse {
                        update_id: content.update_id,
                        state: format!("done"),
                    },
                    _ => StatusResponse {
                        update_id,
                        state: format!("not found"),
                    },
                };

                Ok(HttpResponse::Ok().json(response))
            }
            Err(_) => Ok(HttpResponse::NotFound().json(ErrorResponse {
                reason: format!("Update `{}` not found", info.update_id),
            })),
        },
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[get("/entry/{id}")]
async fn get_by_id<'a>(
    path: web::Path<(String,)>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let index_name = &state.index_name;

    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    match client.get_index(index_name).await {
        Ok(index) => {
            let entry_id = path.into_inner().0;
            let c_entry_id = entry_id.clone();
            match index.get_document::<Entry>(entry_id).await {
                Ok(entry) => Ok(HttpResponse::Ok().json(entry)),
                Err(_) => Ok(HttpResponse::NotFound().json(ErrorResponse {
                    reason: format!("No entry found with id: {}", c_entry_id),
                })),
            }
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[get("/health")]
async fn health<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();
    let c_client = &state.client;
    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    let meilie_health = client.is_healthy().await;

    let response = HealthResponse {
        server_status: "ok".to_string(),
        meilie_health,
    };

    Ok(HttpResponse::Ok().json(response))
}

#[actix_web::main]
async fn main() -> Result<()> {
    // Sets up master key on MeiliSearch and Authentication endpoints
    dotenv::dotenv().ok();

    let ms_secret_key = "MEILI_MASTER_KEY";
    let ms_url_key = "MEILI_BASE_URL";
    let actix_url_key = "ACTIX_SERVER_URL";
    let index_name_key = "INDEX_NAME";

    // Run, only if all four variables exist
    match (
        env::var(ms_secret_key),
        env::var(ms_url_key),
        env::var(actix_url_key),
        env::var(index_name_key),
    ) {
        (Ok(secret_key), Ok(ms_url), Ok(actix_url), Ok(index_name)) => {
            match start_meilisearch().await {
                Ok(_) => {}
                Err(why) => panic!("Could not start MeiliSearch: {:?}", why),
            }

            // Hack to get 'static lifetime
            let boxed_secret_key = boxed_key(secret_key);
            let boxed_ms_url = boxed_key(ms_url);
            let boxed_actix_url = boxed_key(actix_url);
            let boxed_index_name = boxed_key(index_name);

            // Connect to search client
            let ms_client = Client::new(boxed_ms_url, boxed_secret_key);

            match check_meilisearch(&ms_client, boxed_index_name).await {
                Ok(_) => {}
                Err(why) => panic!("Could not check MeiliSearch: {:?}", why),
            };

            let client = Arc::new(Mutex::new(ms_client));

            let state = web::Data::new(AppState {
                client,
                index_name: boxed_index_name,
            });

            env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

            HttpServer::new(move || {
                App::new()
                    .wrap(Logger::default())
                    .wrap(HttpAuthentication::bearer(validator))
                    .wrap(Cors::permissive())
                    .app_data(state.clone())
                    .service(health)
                    .service(get_by_id)
                    .service(bulk)
                    .service(search)
                    .service(later_than)
                    .service(create)
                    .service(edit)
                    .service(check_update)
                    .service(delete)
            })
            .bind(boxed_actix_url)?
            .run()
            .await
        }
        _ => panic!("Missing Env Vars, .env file"),
    }
}
