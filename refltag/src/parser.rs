use chumsky::prelude::*;

use crate::{
    ast::{ParsedBlock, parsers},
    logseq::LogseqBlock,
};

pub fn parser<'src>() -> impl Parser<'src, &'src [LogseqBlock], Vec<ParsedBlock>> {
    block().repeated().at_least(1).collect()
}

fn block<'src>() -> impl Parser<'src, &'src [LogseqBlock], ParsedBlock> {
    any()
        .map(|logseq_block: LogseqBlock| {
            let content = logseq_block.content.to_owned();
            (logseq_block, parsers::expr().parse(&content).unwrap())
        })
        .map(|(entity, expr)| ParsedBlock {
            source: entity,
            expr,
        })
}

pub mod helpers {
    use chumsky::prelude::*;
    use url::Url;

    pub fn url<'src>() -> impl Parser<'src, &'src str, Url> {
        any()
            .filter(|c: &char| !c.is_whitespace())
            .repeated()
            .to_slice()
            .map(|url: &str| Url::parse(url).unwrap())
    }
}
