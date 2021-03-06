mod entry;
mod helpers;
mod mutation;
mod query;
mod start;

use actix_cors::Cors;

use actix_web::{
    body, delete, dev::ServiceRequest, get, middleware::Logger, post, web, App, HttpResponse,
    HttpServer,
};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};
use cached::proc_macro::cached;
use dotenv;
use entry::Entry;
use helpers::*;
use meilisearch_sdk::{client::*, progress::*, search::*};
use mutation::*;
use query::*;
use serde::{Deserialize, Serialize};
use start::{check_meilisearch, start_meilisearch};
use std::env;
use std::io::Result;

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

#[derive(Serialize)]
struct Stats {
    number_of_documents: usize,
    is_indexing: bool,
}

struct AppState<'a> {
    client_url: &'a str,
    client_secret: &'a str,
    index_name: &'a str,
}

#[cached(size = 1, time = 180)]
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

            match res {
                Ok(response) => response.status() == 200,
                Err(_) => {
                    println!("Failed to react: {}", key);
                    return false;
                }
            }
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

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let filter = format!("created_at >= {}", info.created_at);

            let mut response = match (info.offset, info.limit) {
                (Some(offset), Some(limit)) => index
                    .search()
                    .with_offset(offset)
                    .with_limit(limit)
                    .with_filter(&filter)
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
                        .with_filter(&filter)
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
                            .with_filter(&filter)
                            .with_offset(offset)
                            .with_limit(limit)
                            .execute()
                            .await
                            .unwrap_or(SearchResults::<Entry> {
                                hits: vec![],
                                offset,
                                limit,
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

#[get("/infinite")]
async fn infinite<'a>(
    info: web::Query<InfiniteQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let response = index
                .search()
                .with_sort(&["created_at:desc"])
                .with_offset(info.offset)
                .with_limit(info.limit)
                .execute()
                .await
                .unwrap_or(SearchResults::<Entry> {
                    hits: vec![],
                    offset: info.offset,
                    limit: info.limit,
                    nb_hits: 0,
                    exhaustive_nb_hits: false,
                    facets_distribution: None,
                    exhaustive_facets_count: None,
                    processing_time_ms: 0,
                    query: "".to_string(),
                });

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
    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
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

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
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

#[post("/displayed_attributes")]
async fn displayed_attributes<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let attributes = index.get_displayed_attributes().await.unwrap();

            return Ok(HttpResponse::Ok().json(attributes));
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/sortable_attributes")]
async fn sortable_attributes<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let attributes = index.get_sortable_attributes().await.unwrap();

            return Ok(HttpResponse::Ok().json(attributes));
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/ranking_rules")]
async fn ranking_rules<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let rules = index.get_ranking_rules().await.unwrap();

            return Ok(HttpResponse::Ok().json(rules));
        }
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[delete("/reset_ranking_rules")]
async fn reset_ranking_rules<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => match index.reset_ranking_rules().await {
            Ok(_) => Ok(HttpResponse::NoContent().body(body::Body::Empty)),
            Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
                reason: format!("Failed to reset ranking rules"),
            })),
        },
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/config_filter_and_sort")]
async fn config_filter_and_sort<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            if let Err(_) = index.set_filterable_attributes(&["created_at"]).await {
                return Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                    reason: format!("Failed to configure filterable index"),
                }));
            };

            if let Err(_) = index.set_sortable_attributes(&["created_at"]).await {
                return Ok(HttpResponse::InternalServerError().json(ErrorResponse {
                    reason: format!("Failed to configure sortable index"),
                }));
            }

            return Ok(HttpResponse::NoContent().body(body::Body::Empty));
        }
        _ => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
            reason: format!("Failed to create document"),
        })),
    }
}

#[post("/create")]
async fn create<'a>(
    info: web::Json<CreateEntry>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => {
            let created_at = get_current_time_secs();
            let uuid = Uuid::new_v4();
            let entry = Entry {
                id: uuid.to_hyphenated().to_string(),
                title: info.title.clone(),
                description: info.description.clone(),
                created_at,
                organization: info.organization.clone(),
                privacy: match info.privacy {
                    Some(p) => p,
                    None => false,
                },
                links: vec![],
                tags: vec![],
                images: vec![],
            };

            match index.add_or_replace(&[entry], None).await {
                Ok(progress) => match progress.get_status().await {
                    Ok(status) => {
                        let response = match status {
                            UpdateStatus::Processing { content } => StatusResponse {
                                update_id: content.update_id,
                                state: format!("processing"),
                            },
                            UpdateStatus::Enqueued { content } => StatusResponse {
                                update_id: content.update_id,
                                state: format!("enqueued"),
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

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
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

                    match index.add_or_update(&[entry], Some("id")).await {
                        Ok(progress) => match progress.get_status().await {
                            Ok(status) => {
                                let response = match status {
                                    UpdateStatus::Processing { content } => StatusResponse {
                                        update_id: content.update_id,
                                        state: format!("processing"),
                                    },
                                    UpdateStatus::Enqueued { content } => StatusResponse {
                                        update_id: content.update_id,
                                        state: format!("enqueued"),
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

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => match index.delete_document(to_delete).await {
            Ok(progress) => match progress.get_status().await {
                Ok(status) => {
                    let response = match status {
                        UpdateStatus::Processing { content } => StatusResponse {
                            update_id: content.update_id,
                            state: format!("processing"),
                        },
                        UpdateStatus::Enqueued { content } => StatusResponse {
                            update_id: content.update_id,
                            state: format!("enqueued"),
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

    let client = Client::new(state.client_url, state.client_secret);

    let update_id = info.update_id;

    match client.get_index(state.index_name).await {
        Ok(index) => match index.get_update(update_id).await {
            Ok(status) => {
                let response = match status {
                    UpdateStatus::Processing { content } => StatusResponse {
                        update_id: content.update_id,
                        state: format!("processing"),
                    },
                    UpdateStatus::Enqueued { content } => StatusResponse {
                        update_id: content.update_id,
                        state: format!("enqueued"),
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
            Err(_) => Ok(HttpResponse::Ok().json(StatusResponse {
                update_id,
                state: format!("not found"),
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

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
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

    let client = Client::new(state.client_url, state.client_secret);

    let meilie_health = client.is_healthy().await;

    let response = HealthResponse {
        server_status: "ok".to_string(),
        meilie_health,
    };

    Ok(HttpResponse::Ok().json(response))
}

#[get("/stats")]
async fn stats<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();

    let client = Client::new(state.client_url, state.client_secret);

    match client.get_index(state.index_name).await {
        Ok(index) => match index.get_stats().await {
            Ok(meili_stats) => {
                let stats = Stats {
                    number_of_documents: meili_stats.number_of_documents,
                    is_indexing: meili_stats.is_indexing,
                };

                Ok(HttpResponse::Ok().json(stats))
            }
            Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
                reason: format!("No stats for client"),
            })),
        },
        Err(_) => Ok(HttpResponse::ServiceUnavailable().json(ErrorResponse {
            reason: format!("No client"),
        })),
    }
}

#[post("/create_dump")]
async fn create_dump<'a>(data: web::Data<AppState<'a>>) -> Result<HttpResponse> {
    let state = &data.clone();
    let client = Client::new(state.client_url, state.client_secret);

    match client.create_dump().await {
        Ok(_) => Ok(HttpResponse::NoContent().body(body::Body::Empty)),
        Err(_) => Ok(HttpResponse::InternalServerError().json(ErrorResponse {
            reason: format!("Failed to create dump"),
        })),
    }
}

#[actix_web::main]
async fn main() -> Result<()> {
    std::env::set_var("RUST_LOG", "info");
    std::env::set_var("RUST_BACKTRACE", "1");
    // Sets up master key on MeiliSearch and Authentication endpoints
    dotenv::dotenv().ok();

    let ms_secret_key = "MEILI_MASTER_KEY";
    let ms_url_key = "MEILI_BASE_URL";
    let actix_url_key = "ACTIX_SERVER_URL";
    let index_name_key = "INDEX_NAME";
    let meili_path = "MEILI_PATH";

    let ms_path = env::var(meili_path).unwrap_or("./meilisearch".to_string());

    // Run, only if all four variables exist
    match (
        env::var(ms_secret_key),
        env::var(ms_url_key),
        env::var(actix_url_key),
        env::var(index_name_key),
    ) {
        (Ok(secret_key), Ok(ms_url), Ok(actix_url), Ok(index_name)) => {
            match start_meilisearch(&ms_path).await {
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

            let state = web::Data::new(AppState {
                client_url: boxed_ms_url,
                client_secret: boxed_secret_key,
                index_name: boxed_index_name,
            });

            env_logger::init();

            HttpServer::new(move || {
                App::new()
                    .wrap(Logger::default())
                    .wrap(HttpAuthentication::bearer(validator))
                    .wrap(Cors::permissive())
                    .app_data(state.clone())
                    .service(stats)
                    .service(health)
                    .service(get_by_id)
                    .service(bulk)
                    .service(search)
                    .service(later_than)
                    .service(config_filter_and_sort)
                    .service(infinite)
                    .service(create)
                    .service(edit)
                    .service(check_update)
                    .service(delete)
                    .service(create_dump)
                    .service(displayed_attributes)
                    .service(sortable_attributes)
                    .service(ranking_rules)
                    .service(reset_ranking_rules)
            })
            .bind(boxed_actix_url)?
            .run()
            .await
        }
        _ => panic!("Missing Env Vars, .env file"),
    }
}
