use chumsky::{
    prelude::*,
    text::{Char, newline},
};
use uuid::Uuid;

use crate::logseq::IBlockEntity;

pub fn generate_blocks(src: &str) -> Vec<impl IBlockEntity> {
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
                .map(BlockEntityMock::new)
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

#[derive(Debug)]
struct BlockEntityMock {
    uuid: String,
    pub content: String,
    pub children: Vec<BlockEntityMock>,
}

impl IBlockEntity for BlockEntityMock {
    fn uuid(this: &Self) -> js_sys::JsString {
        this.uuid.to_owned().into()
    }

    fn content(this: &Self) -> js_sys::JsString {
        this.content.to_owned().into()
    }
}

impl BlockEntityMock {
    fn new(content: String) -> BlockEntityMock {
        BlockEntityMock {
            uuid: Uuid::new_v4().to_string(),
            content,
            children: Vec::new(),
        }
    }
}
