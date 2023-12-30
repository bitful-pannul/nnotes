use std::collections::HashMap;

use anyhow::{self};
use serde::{Deserialize, Serialize};
use uqbar_process_lib::{
    await_message, get_payload,
    http::{
        bind_http_path, send_response,
        serve_ui, HttpServerRequest, IncomingHttpRequest, StatusCode,
    },
    println, Address, Message,
    vfs::{create_drive, create_file, open_dir, Directory, FileType, open_file, metadata}
};

wit_bindgen::generate!({
    path: "wit",
    world: "process",
    exports: {
        world: Component,
    },
});

#[derive(Debug, Serialize, Deserialize)]
enum NoteRequest {
    SaveNote { path: String, body: String },
    // GetNote { path: String },
}

#[derive(Debug, Serialize, Deserialize)]
struct NoteInfo {
    path: String,
    is_dir: bool,
    body: String,
}

#[derive(Debug, Serialize, Deserialize)]
enum NoteResponse {
    Ack,
    AllNotes { notes: Vec<NoteInfo>},  // path, is_dir
    Note { path: String, body: String },
}

// for url path parsing
fn strip_url(url: &str, substring: &str) -> String {
    url.find(substring)
       .map(|index| &url[index + substring.len()..])
       .unwrap_or("")
       .to_string()
}

fn handle_http_server_request(
    _our: &Address,
    drive_dir: &Directory, 
    _source: &Address,
    ipc: &[u8],
) -> anyhow::Result<()> {
    let Ok(server_request) = serde_json::from_slice::<HttpServerRequest>(ipc) else {
        println!("notenecs: couldn't parse request!");
        return Ok(());
    };

    match server_request {
        HttpServerRequest::WebSocketOpen { .. } => {
            // Note: not using websockets rn
        }
        HttpServerRequest::WebSocketPush { .. } => {
            // Note: not using websockets rn
        }
        HttpServerRequest::WebSocketClose(_channel_id) => {}
        HttpServerRequest::Http(IncomingHttpRequest { method, raw_path, .. }) => {
            match method.as_str() {
                // Get a path
                "GET" => {
                    let mut headers = HashMap::new();
                    headers.insert("Content-Type".to_string(), "application/json".to_string());
                    
                    let mut path = strip_url(&raw_path, &"template.uq/notes");
                    println!("path baby: {}", &path);
                    // todo better paths 
                    if path == "" {
                        path = drive_dir.path.clone();
                    } else {
                        path = format!("{}{}", &drive_dir.path, path);
                    }

                    let metadata = metadata(&path)?;

                    match metadata.file_type {
                        FileType::Directory => {
                            let dir = open_dir(&path, false)?;
                            let entries = dir.read()?;
                            let entries = entries
                            .iter()
                            .map(|entry| {
                                let path = format!("{}/{}", &drive_dir.path, entry.path);
                                let is_dir = entry.file_type == FileType::Directory;
                                NoteInfo { path, is_dir, body: "".into() }
                            })
                            .collect::<Vec<_>>();

                            send_response(
                                StatusCode::OK,
                                Some(headers),
                                serde_json::to_vec(&NoteResponse::AllNotes { notes: entries }).unwrap(),
                            )?;
                        }
                        FileType::File => {
                            let file = open_file(&path, false)?;
                            let bytes = file.read()?;
                            let text = String::from_utf8(bytes)?;

                            send_response(
                                StatusCode::OK,
                                Some(headers),
                                serde_json::to_vec(&NoteResponse::Note { path: path, body: text }).unwrap(),
                            )?;                        }
                        _ => println!("got something else than dir or file...")
                    }
                }
                // Send a message
                "POST" => {
                    let Some(payload) = get_payload() else {
                        println!("no payload in BOST");
                        return Ok(());
                    };
                    handle_note_request(
                        &drive_dir,
                        &payload.bytes,
                    )?;

                    // Send an http response via the http server
                    send_response(StatusCode::CREATED, None, vec![])?;
                }
                _ => {
                    // Method not allowed
                    send_response(StatusCode::METHOD_NOT_ALLOWED, None, vec![])?;
                }
            }
        }
    };

    Ok(())
}

fn handle_note_request(
    drive_dir: &Directory,
    ipc: &[u8],
) -> anyhow::Result<()> {
    let Ok(chat_request) = serde_json::from_slice::<NoteRequest>(ipc) else {
        println!("couldn't parse note request!");
        return Ok(());
    };

    match chat_request {
        NoteRequest::SaveNote {
            path,
            body,
        } => {
            let file_path = format!("{}/{}", &drive_dir.path, path);
            let file = create_file(&file_path)?;
            file.write(body.as_bytes())?;
        }
    };

    Ok(())
}

fn handle_message(
    our: &Address,
    drive_dir: &Directory,
) -> anyhow::Result<()> {
    let message = await_message()?;

    match message {
        Message::Response { .. } => {
            println!("notenecs: got response - {:?}", message);
            return Ok(());
        }
        Message::Request {
            ref source,
            ref ipc,
            ..
        } => {
            // Requests that come from our http server, handle intranode later too. 
            handle_http_server_request(our, drive_dir, source, ipc)?;
        }
    }

    Ok(())
}

struct Component;
impl Guest for Component {
    fn init(our: String) {
        println!("notenecs: begin");

        let our = Address::from_str(&our).unwrap();
        // let mut channel_id = 0;

        // Bind UI files to routes; index.html is bound to "/"
        serve_ui(&our, "ui").unwrap();

        // Bind HTTP path /messages
        bind_http_path("/notes", true, false).unwrap();
        bind_http_path("/notes/*", true, false).unwrap();

        // Bind WebSocket path
        // bind_ws_path("/", true, false).unwrap();

        // Create vfs drive
        let drive = create_drive(our.package_id(), "notes").unwrap();
        let drive_dir = open_dir(&drive, false).unwrap();

        loop {
            match handle_message(&our, &drive_dir) {
                Ok(()) => {}
                Err(e) => {
                    println!("notenecs: error: {:?}", e);
                }
            };
        }
    }
}
