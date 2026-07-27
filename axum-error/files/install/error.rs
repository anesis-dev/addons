// This module is a vocabulary, not a call site: nothing references `AppError`
// until a handler starts returning it, and until then `dead_code` would warn on
// every build of a freshly scaffolded project.
#![allow(dead_code)]

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;

/// The one error type handlers return.
///
/// Every variant carries the status code it maps to, so a handler can bubble a
/// failure up with `?` and still produce the right response — the alternative is
/// each handler hand-building its own `(StatusCode, Json(...))` tuple and
/// drifting from the others.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("{0}")]
    BadRequest(String),

    #[error("unauthorized")]
    Unauthorized,

    #[error("{0} not found")]
    NotFound(String),

    #[error("{0}")]
    Conflict(String),

    /// Anything the client cannot act on. The cause is logged, never returned:
    /// error text from a database or an upstream API leaks schema and topology.
    #[error("internal error")]
    Internal(#[from] anyhow::Error),
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let status = match &self {
            AppError::BadRequest(_) => StatusCode::BAD_REQUEST,
            AppError::Unauthorized => StatusCode::UNAUTHORIZED,
            AppError::NotFound(_) => StatusCode::NOT_FOUND,
            AppError::Conflict(_) => StatusCode::CONFLICT,
            AppError::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
        };

        if let AppError::Internal(cause) = &self {
            eprintln!("internal error: {cause:?}");
        }

        (
            status,
            Json(ErrorBody {
                error: self.to_string(),
            }),
        )
            .into_response()
    }
}

/// What handlers return: `Ok` is whatever the handler produces, `Err` is an
/// [`AppError`] that already knows how to become a response.
pub type AppResult<T> = Result<T, AppError>;
