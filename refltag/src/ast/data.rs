use scraper::Html;
pub enum Value {
    String(String),
    HTMLDocument(Html),
}

impl Into<Value> for Html {
    fn into(self) -> Value {
        Value::HTMLDocument(self)
    }
}
