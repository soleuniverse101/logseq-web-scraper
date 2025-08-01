use chumsky::Parser;

use crate::{    logseq::LogseqBlock, parser,     test::blocks_generator::generate_blocks};

pub mod blocks_generator;

#[test]
fn generating_blocks() {
    let src = std::fs::read_to_string("src/examples/one-line.refltag").unwrap();

    assert!(
        generate_blocks(&src)
            .iter()
            .zip(&vec![LogseqBlock::generate("parse https://www.google.com")])
            .all(|(a, b)| a.content_eq(b))
    );
}
