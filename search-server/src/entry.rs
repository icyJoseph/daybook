use meilisearch_sdk::document::Document;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Entry {
    pub id: String,
    pub title: String,
    pub description: String,
    pub created_at: u64,
    pub organization: Option<String>,
    pub privacy: bool,
    pub links: Vec<String>,
    pub tags: Vec<String>,
    pub images: Vec<String>,
}

impl Clone for Entry {
    fn clone(&self) -> Self {
        Entry {
            id: self.id.clone(),
            title: self.title.clone(),
            description: self.description.clone(),
            created_at: self.created_at,
            privacy: self.privacy,
            organization: self.organization.clone(),
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
