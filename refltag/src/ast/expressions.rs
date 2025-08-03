use url::Url;

#[derive(Debug, Clone)]
pub struct Fetch {
    pub url: Url,
    pub text: Option<String>,
}

impl Fetch {
    pub fn new(url: Url) -> Expr {
        Expr::Fetch(Fetch { url, text: None })
    }
}

#[derive(Debug, Clone)]
pub enum Expr {
    Fetch(Fetch),
}
