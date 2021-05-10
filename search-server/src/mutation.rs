use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CreateEntry {
    pub title: String,
    pub description: String,
    pub organization: Option<String>,
    pub privacy: Option<bool>,
    pub links: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub images: Option<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateTitle {
    pub id: String,
    pub new_title: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateDescription {
    pub id: String,
    pub new_description: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePrivacy {
    pub id: String,
    pub new_privacy: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DeleteEntry {
    pub id: String,
}

/// Returns time in SECONDS
pub fn get_mutation_time() -> u64 {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    }
}
