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
pub struct EditEntry {
    id: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub organization: Option<String>,
    pub privacy: Option<bool>,
    pub links: Option<Vec<String>>,
    pub tags: Option<Vec<String>>,
    pub images: Option<Vec<String>>,
}

impl EditEntry {
    pub fn get_id(&self) -> String {
        self.id.to_string()
    }
}
