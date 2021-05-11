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
