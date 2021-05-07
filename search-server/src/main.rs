use actix_cors::Cors;
use actix_web::{
    dev::ServiceRequest, get, middleware::Logger, post, web, App, HttpResponse, HttpServer,
};
use actix_web_httpauth::{extractors::bearer::BearerAuth, middleware::HttpAuthentication};
use meilisearch_sdk::{client::*, document::*, indexes::*, search::*};
use serde::{Deserialize, Serialize};
use std::boxed::Box;
use std::io::Result;
use std::sync::{Arc, Mutex};
use std::{fs::File, io::prelude::*};

use env_logger::Env;

#[derive(Serialize, Deserialize, Debug)]
struct Entry {
    id: String,
    title: String,
    description: String,
    day: String,
    privacy: bool,
    links: Vec<String>,
    tags: Vec<String>,
    images: Vec<String>,
}

impl Clone for Entry {
    fn clone(&self) -> Self {
        Entry {
            id: self.id.clone(),
            title: self.title.clone(),
            description: self.description.clone(),
            day: self.day.clone(),
            privacy: self.privacy,
            links: self.links.clone(),
            tags: self.tags.clone(),
            images: self.images.clone(),
        }
    }
}

impl Document for Entry {
    type UIDType = String;
    fn get_uid(&self) -> &Self::UIDType {
        &self.id
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct SearchQuery {
    query: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct AllQuery {
    qty: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug)]
struct QueryResponse {
    hits: Vec<Entry>,
    processing_time_ms: usize,
    offset: usize,
    limit: usize,
    nb_hits: usize,
    exhaustive_nb_hits: bool,
}

impl QueryResponse {
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

struct AppState<'a> {
    client: Arc<Mutex<Client<'a>>>,
}

async fn seed_ms<'a>(client: &Client<'a>) -> Result<(Option<String>, Option<String>)> {
    // reading and parsing the seed file
    let mut file = File::open("./db/entries.json").unwrap();
    let mut content = String::new();
    file.read_to_string(&mut content).unwrap();
    let entries_doc: Vec<Entry> = serde_json::from_str(&content).unwrap();

    // get or create a search index on
    let entries = client.get_or_create("entries").await.unwrap();

    entries.add_documents(&entries_doc, None).await.unwrap();

    let is_healthy = client.is_healthy().await;

    if is_healthy {
        match client.get_keys().await {
            Ok(keys) => return Ok((keys.private, keys.public)),
            Err(_) => return Ok((None, None)),
        }
    }

    panic!("Client was not healthy")
}

fn boxed_key(s: String) -> &'static str {
    Box::leak(s.into_boxed_str())
}

#[get("/bulk")]
async fn bulk<'a>(
    info: web::Query<AllQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let c_client = &data.clone().client;

    let arc_client = &c_client.clone();
    let client = arc_client.lock().unwrap();

    let index: Index = client.get_index("entries").await.unwrap();

    let all = index
        .get_documents::<Entry>(None, info.qty, None)
        .await
        .unwrap();

    Ok(HttpResponse::Ok().json(all))
}

#[get("/search")]
async fn search<'a>(
    info: web::Query<SearchQuery>,
    data: web::Data<AppState<'a>>,
) -> Result<HttpResponse> {
    let c_client = &data.clone().client;

    let arc_client = &c_client.clone();

    let client = arc_client.lock().unwrap();

    let index = client.get_index("entries").await.unwrap();

    let results: SearchResults<Entry> = index
        .search()
        .with_query(&info.0.query)
        .execute()
        .await
        .unwrap();

    let response = QueryResponse::new(results);

    Ok(HttpResponse::Ok().json(response))
}

async fn validator(
    req: ServiceRequest,
    credentials: BearerAuth,
) -> actix_web::Result<ServiceRequest, actix_web::Error> {
    let token = credentials.token();

    let web_client = actix_web::client::Client::default();

    let res = web_client
        .get("https://icjoseph.eu.auth0.com/userinfo")
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await;

    let status = res.unwrap().status();

    if status == 200 {
        return Ok(req);
    }

    return Err(actix_web::error::ErrorUnauthorized("Error"));
}

#[actix_web::main]
async fn main() -> Result<()> {
    let mut args = std::env::args();

    args.next();

    match args.next() {
        Some(secret) => {
            // Hack to make secret of 'static lifetime
            let key = boxed_key(secret);

            // Connect to search client
            let ms_client = Client::new("http://localhost:7700", key);

            match seed_ms(&ms_client).await {
                Ok(_) => println!("Happy Hacking"),
                Err(why) => println!("{:?}", why),
            }

            let client = Arc::new(Mutex::new(ms_client));

            let state = web::Data::new(AppState { client });

            env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

            HttpServer::new(move || {
                App::new()
                    .wrap(Logger::default())
                    .wrap(HttpAuthentication::bearer(validator))
                    .wrap(Cors::permissive())
                    .app_data(state.clone())
                    .service(bulk)
                    .service(search)
            })
            .bind("127.0.0.1:1234")?
            .run()
            .await
        }
        None => panic!("Missing secret"),
    }
}
