use chumsky::{
    prelude::*,
    text::{Char, newline},
};
use uuid::Uuid;

use crate::logseq::IBlockEntity;

pub fn generate_blocks(src: &str) -> Vec<BlockEntityMock> {
    match parser().parse(src).into_result() {
        Ok(blocks) => blocks,
        Err(err) => {
            eprintln!("{err:#?}");
            Vec::new()
        }
    }
}

fn parser<'src>() -> impl Parser<'src, &'src str, Vec<BlockEntityMock>, extra::Err<Rich<'src, char>>>
{
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
            dyn Parser<'_, &'src str, BlockEntityMock, extra::Full<Rich<'src, char>, (), usize>>,
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
                .map(|content| BlockEntityMock::new(&content))
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

/// Mocks a Logseq BlockEntity. Note that equality doesn't apply to its UUID!
#[derive(Debug)]
pub struct BlockEntityMock {
    uuid: String,
    pub content: String,
    pub children: Vec<BlockEntityMock>,
}

impl IBlockEntity for BlockEntityMock {
    fn uuid(this: &Self) -> String {
        this.uuid.to_owned()
    }

    fn content(this: &Self) -> String {
        this.content.to_owned()
    }

    fn content_eq(&self, other: &BlockEntityMock) -> bool {
        self.content == other.content
            && self
                .children
                .iter()
                .zip(&other.children)
                .all(|(a, b)| a.content_eq(b))
    }
}

impl BlockEntityMock {
    pub fn new(content: &str) -> BlockEntityMock {
        BlockEntityMock {
            uuid: Uuid::new_v4().to_string(),
            content: content.to_string(),
            children: Vec::new(),
        }
    }
}
