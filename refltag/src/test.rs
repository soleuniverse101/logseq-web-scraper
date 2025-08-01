use crate::{
    logseq::IBlockEntity,
    test::blocks_generator::{BlockEntityMock, generate_blocks},
};

pub mod blocks_generator;

#[test]
fn generating_blocks() {
    let src = std::fs::read_to_string("src/examples/one-line.refltag").unwrap();

    assert!(
        generate_blocks(&src)
            .iter()
            .zip(&vec![BlockEntityMock::new("parse https://www.google.com")])
            .all(|(a, b)| a.content_eq(b))
    );
}
