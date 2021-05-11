use std::boxed::Box;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn boxed_key(s: String) -> &'static str {
    Box::leak(s.into_boxed_str())
}

/// Returns time in SECONDS
pub fn get_current_time_secs() -> u64 {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(n) => n.as_secs(),
        Err(_) => panic!("SystemTime before UNIX EPOCH!"),
    }
}
