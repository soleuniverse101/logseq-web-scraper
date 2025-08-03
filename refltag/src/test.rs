use chumsky::Parser;

use crate::{
    interpreter::{Interpreter, OutputBlock, OutputSpan},
    logseq::LogseqBlock,
    output, parser,
    test::blocks_generator::generate_blocks,
};

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

#[test]
fn parsing_blocks() {
    let src = std::fs::read_to_string("src/examples/one-line.refltag").unwrap();
    let blocks = generate_blocks(&src);

    println!("{:#?}", parser().parse(blocks.as_slice()));
    todo!()
}

#[test]
fn requests_examples() {
    assert_eq!(output!("Google"), request_output("one-line.refltag"));
    assert_eq!(output!("Custom Title!\n!"), request_output("custom-text.refltag"));
}

fn request_output(file_name: &str) -> OutputSpan {
    let src = std::fs::read_to_string(format!("src/examples/{file_name}")).unwrap();
    let blocks = generate_blocks(&src);
    let ast = parser().parse(blocks.as_slice()).unwrap();
    let mut interpreter = Interpreter::new();
    interpreter.interpret(&ast)
}
