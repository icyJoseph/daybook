use meilisearch_sdk::{client::*, indexes::*};
use std::io::Result;
use std::process::{Command, Stdio};
use std::{thread, time};

/// Start MeilieSearch instance. Kills the instance if the parent process is shutdown using Ctrl-C
pub async fn start_meilisearch(path: &str) -> std::io::Result<()> {
    // Start a MeiliSearch instance
    let mut child = Command::new(path).stdout(Stdio::piped()).spawn()?;

    // If the server is shutdown, kill the MeiliSearch instance
    ctrlc::set_handler(move || match child.kill() {
        Ok(_) => println!("Shutdown MeiliSearch"),
        Err(why) => println!("Failed to shutdown MeiliSearch: {:?}", why),
    })
    .expect("Error setting Ctrl-C handler");
    // let the meilisearch instance start
    thread::sleep(time::Duration::from_secs(2));

    Ok(())
}

/// Runs a simple check for client health
/// and presence of `entries` index
pub async fn check_meilisearch<'a>(client: &Client, index_name: &str) -> Result<()> {
    let index: Index = match client.get_or_create(index_name).await {
        Ok(res) => res,
        Err(why) => panic!("{:?}", why),
    };

    let stats: IndexStats = match index.get_stats().await {
        Ok(res) => res,
        Err(why) => panic!("{:?}", why),
    };

    let is_healthy = client.is_healthy().await;

    if is_healthy {
        println!("Healthy Client");
        println!(
            "`{}` index contains: {} documents",
            index_name, stats.number_of_documents
        );

        return Ok(());
    }

    panic!("Client was not healthy")
}
