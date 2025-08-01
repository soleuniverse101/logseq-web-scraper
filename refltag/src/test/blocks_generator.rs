use chumsky::{
    prelude::*,
    text::{Char, newline},
};
use uuid::Uuid;

use crate::logseq::LogseqBlock;

pub fn generate_blocks(src: &str) -> Vec<LogseqBlock> {
    match parser().parse(src).into_result() {
        Ok(blocks) => blocks,
        Err(err) => {
            eprintln!("{err:#?}");
            Vec::new()
        }
    }
}

fn parser<'src>() -> impl Parser<'src, &'src str, Vec<LogseqBlock>, extra::Err<Rich<'src, char>>> {
    let known_indent = just(' ')
        .repeated()
        .configure(|repeat, ctx_indent: &usize| repeat.exactly(*ctx_indent));

    let line = any()
        .filter(|c: &char| !c.is_whitespace())
        .repeated()
        .at_least(1)
        .to_slice()
        .then(
            any()
                .filter(|c: &char| !c.is_newline())
                .repeated()
                .to_slice(),
        )
        .map(|(first, rest)| format!("{first}{rest}"));

    let block = recursive(
        |block: Recursive<
            dyn Parser<'_, &'src str, LogseqBlock, extra::Full<Rich<'src, char>, (), usize>>,
        >| {
            known_indent
                .ignore_then(line)
                .foldl(
                    newline()
                        .ignore_then(known_indent)
                        .ignore_then(line)
                        .repeated(),
                    |mut content, extra_line| {
                        content.push('\n');
                        content.push_str(&extra_line);
                        content
                    },
                )
                .map(|content| LogseqBlock::generate(&content))
                .foldl(
                    map_ctx(|indent| indent + 1, newline().ignore_then(block)).repeated(),
                    |mut block, child| {
                        block.children.push(child);
                        block
                    },
                )
        },
    );

    block
        .with_ctx(0)
        .separated_by(group((newline(), newline())))
        .collect()
}

impl LogseqBlock {
    pub fn content_eq(&self, other: &LogseqBlock) -> bool {
        self.content == other.content
            && self
                .children
                .iter()
                .zip(&other.children)
                .all(|(a, b)| a.content_eq(b))
    }

    pub fn generate(content: &str) -> LogseqBlock {
        LogseqBlock {
            uuid: Uuid::new_v4().to_string(),
            content: content.to_string(),
            children: Vec::new(),
        }
    }
}
