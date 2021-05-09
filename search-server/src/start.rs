use std::process::Command;

/// Start MeilieSearch instance. Kills the instance if the parent process is shutdown using Ctrl-C
pub fn start_meilisearch() {
    // Start a MeiliSearch instance
    let mut child = Command::new("./meilisearch")
        .spawn()
        .expect("Failed to start MeiliSearch");

    // If the server is shutdown, kill the MeiliSearch instance
    ctrlc::set_handler(move || match child.kill() {
        Ok(_) => println!("Shutdown MeiliSearch"),
        Err(why) => println!("Failed to shutdown MeiliSearch: {:?}", why),
    })
    .expect("Error setting Ctrl-C handler");
}
