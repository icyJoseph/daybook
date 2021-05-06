use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use meilisearch_sdk::{client::*, document::*, errors::Error, search::SearchResults};
use serde::{Deserialize, Serialize};
use std::boxed::Box;
use std::sync::{Arc, Mutex};
use std::{fs::File, io::prelude::*};

#[derive(Serialize, Deserialize, Debug)]
struct Entry {
    id: String,
    #[serde(flatten)]
    value: serde_json::Value,
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

struct AppState<'a> {
    client: Arc<Mutex<Client<'a>>>,
}

async fn seed_ms<'a>(client: &Client<'a>) -> Result<(Option<String>, Option<String>), Error> {
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

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

async fn search<'a>(
    info: web::Query<SearchQuery>,
    data: web::Data<AppState<'a>>,
) -> impl Responder {
    println!("You reached search!");
    println!("{:?}", info);
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

    println!("{:?}", results);

    HttpResponse::Ok().body(results.query)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let mut args = std::env::args();

    args.next();

    match args.next() {
        Some(secret) => {
            // Connect to search client
            let key = boxed_key(secret);
            let ms_client = Client::new("http://localhost:7700", key);

            // Keys are not really needed since we are connecting
            // to the client using the master key
            // This server also works as a proxy that severely limits
            // the requests that can be made to the meilie server
            match seed_ms(&ms_client).await {
                Ok(keys) => {
                    println!("{:?} {:?}", keys.0, keys.1);
                    println!("Happy Hacking");
                }
                Err(why) => println!("{:?}", why),
            }

            let client = Arc::new(Mutex::new(ms_client));

            let state = web::Data::new(AppState { client });

            match HttpServer::new(move || {
                App::new()
                    .app_data(state.clone())
                    .service(hello)
                    .route("/search", web::get().to(search))
            })
            .bind("127.0.0.1:1234")
            {
                Ok(e) => e.run().await,
                Err(why) => panic!("{:?}", why),
            }
        }
        None => panic!("Missing secret"),
    }
}
