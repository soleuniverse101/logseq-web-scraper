use std::fmt::Debug;

use wasm_bindgen::prelude::*;

pub trait IBlockEntity: Debug {
    fn uuid(this: &Self) -> String;
    fn content(this: &Self) -> String;
    fn content_eq(&self, other: &Self) -> bool;
}

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

impl IBlockEntity for BlockEntity {
    fn uuid(this: &Self) -> String {
        this.uuid()
    }

    fn content(this: &Self) -> String {
        this.content()
    }
    
    fn content_eq(&self, other: &Self) -> bool {
        todo!()
    }
}

struct Block<'a> {
    uuid: &'a str,
    children: Vec<Block<'a>>,
}
