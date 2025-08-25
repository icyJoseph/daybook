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
pub async fn check_meilisearch(client: &Client, index_name: &str) -> Result<()> {
    let index: Index = match client.get_index(index_name).await {
        Ok(res) => res,
        Err(_) => match client.create_index(index_name, Some("id")).await {
            Ok(task_id) => {
                let Ok(_) = client.get_task(task_id).await else {
                    panic!("Failed to create required index")
                };

                let Ok(res) = client.get_index(index_name).await else {
                    panic!("Created but failed to get required index")
                };

                res
            }

            Err(_) => panic!("Could not find, nor create the required index"),
        },
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
