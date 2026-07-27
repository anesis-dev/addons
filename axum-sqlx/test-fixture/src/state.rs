// anesis:top-imports

/// Shared application state, handed to every handler by axum's `State`
/// extractor.
///
/// Built with a struct literal in `main.rs` rather than a positional
/// constructor, so adding a field (a database pool, a HTTP client, a config
/// struct) touches one line here and one line at the call site.
#[derive(Clone)]
pub struct AppState {
    pub app_name: String,
    // anesis:state-fields
}
