use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BulkQuery {
    pub qty: Option<usize>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FromQuery {
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QueryResponse<T> {
    pub hits: Vec<T>,
    pub processing_time_ms: usize,
    pub offset: usize,
    pub limit: usize,
    pub nb_hits: usize,
    pub exhaustive_nb_hits: bool,
}
