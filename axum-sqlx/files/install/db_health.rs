use axum::{Json, extract::State, http::StatusCode};
use serde::Serialize;

use crate::state::AppState;

#[derive(Serialize)]
pub struct DbHealth {
    pub database: &'static str,
}

/// Readiness for the database specifically.
///
/// Kept separate from `/health`: a process that is alive but cannot reach
/// Postgres should fail readiness without also failing liveness, or an
/// orchestrator restarts a container that was never broken.
pub async fn db_health(State(state): State<AppState>) -> (StatusCode, Json<DbHealth>) {
    match sqlx::query("SELECT 1").execute(&state.db).await {
        Ok(_) => (StatusCode::OK, Json(DbHealth { database: "ok" })),
        Err(error) => {
            eprintln!("database health check failed: {error}");
            (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(DbHealth {
                    database: "unreachable",
                }),
            )
        }
    }
}
