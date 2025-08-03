mod ast;
pub mod interpreter;
mod logseq;
mod parser;
mod utils;
mod web;
mod error;

#[cfg(test)]
pub mod test;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, refltag!");
}
