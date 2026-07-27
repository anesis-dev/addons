mod handlers;
mod routers;
mod services;
mod state;
// anesis:modules

use std::net::SocketAddr;
use std::{env, str::FromStr};

use state::AppState;
// anesis:top-imports

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);
    let frontend_url =
        env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

    // anesis:startup

    let state = AppState {
        app_name: "app".to_string(),
        // anesis:state-init
    };
    let app = routers::create_router(&frontend_url).with_state(state);

    let address = SocketAddr::from_str(&format!("{host}:{port}")).unwrap();
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();

    println!("Server running on http://{address}");

    axum::serve(listener, app).await.unwrap();
}
