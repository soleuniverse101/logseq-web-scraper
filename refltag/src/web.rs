use scraper::Html;
use url::Url;

#[cfg(test)]
pub fn fetch_from_url(url: &Url) -> Html {
    let html = reqwest::blocking::get(url.as_str())
        .expect("Fetching url failed")
        .text()
        .expect("Parsing fetch text failed");
    Html::parse_document(&html)
}

#[cfg(not(test))]
pub fn fetch_from_url(_url: &Url) -> Html {
    let html = "HTML Content".to_string();
    Html::parse_document(&html)
}
