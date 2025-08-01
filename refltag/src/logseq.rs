use std::fmt::Debug;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[derive(Debug, Clone)]
    pub type BlockEntity;

    #[wasm_bindgen(method, getter)]
    pub fn uuid(this: &BlockEntity) -> String;

    #[wasm_bindgen(method, getter)]
    pub fn children(this: &BlockEntity) -> Box<[BlockEntity]>;

    #[wasm_bindgen(method, getter)]
    pub fn content(this: &BlockEntity) -> String;
}

#[derive(Debug, Clone)]
pub struct LogseqBlock {
    pub uuid: String,
    pub content: String,
    pub children: Vec<LogseqBlock>,
}

impl From<&BlockEntity> for LogseqBlock {
    fn from(value: &BlockEntity) -> Self {
        let children = value.children();
        LogseqBlock {
            uuid: value.uuid(),
            content: value.content(),
            children: if children.is_empty() {
                Vec::new()
            } else {
                children.iter().map(|child| child.into()).collect()
            },
        }
    }
}
