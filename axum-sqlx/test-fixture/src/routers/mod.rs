use axum::{
    Router,
    http::{HeaderValue, Method, header},
    routing::get,
};
use tower_http::cors::CorsLayer;

use crate::{handlers, state::AppState};
// anesis:top-imports

pub fn create_router(frontend_url: &str) -> Router<AppState> {
    let cors = CorsLayer::new()
        .allow_origin(
            frontend_url
                .parse::<HeaderValue>()
                .expect("FRONTEND_URL must be a valid header value"),
        )
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION])
        .allow_credentials(true);

    Router::new()
        .route("/", get(handlers::root))
        .route("/health", get(handlers::health))
        // anesis:routes
        .layer(cors)
    // anesis:layers
}
