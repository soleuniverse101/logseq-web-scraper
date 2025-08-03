pub mod environment;

use scraper::Selector;

use crate::{
    ast::{ParsedBlock, expressions::Fetch, visitor::InterpretExpr},
    interpreter::environment::Environment,
    web::fetch_from_url,
};

pub type OutputSpan = Vec<OutputBlock>;

#[derive(Debug, PartialEq)]
pub struct OutputBlock {
    pub content: String,
    pub children: OutputSpan,
}

#[macro_export]
macro_rules! output {
    ($content:literal) => {
        vec![OutputBlock {
            content: $content.to_string(),
            children: Vec::new(),
        }]
    };
    ($content:expr) => {
        vec![OutputBlock {
            content: $content,
            children: Vec::new(),
        }]
    };
}

pub struct Interpreter {
    environment: Environment,
}

impl Interpreter {
    pub fn interpret(&mut self, blocks: &[ParsedBlock]) -> OutputSpan {
        let mut output = Vec::new();
        blocks.iter().for_each(|block| {
            output.append(&mut block.expr.interpret(self));
        });
        output
    }

    pub fn new() -> Interpreter {
        Interpreter {
            environment: Environment::new(),
        }
    }
}

impl InterpretExpr for Interpreter {
    fn interpret_fetch(&mut self, fetch: &Fetch) -> OutputSpan {
        // let root = fetch_site(&fetch.url);
        let root = fetch_from_url(&fetch.url);
        let title = fetch.text.to_owned().unwrap_or(root
            .select(&Selector::parse("title").unwrap())
            .next()
            .unwrap()
            .text()
            .next()
            .unwrap()
            .to_string());
        self.environment.set_scope_root(root);

        output!(title)
    }
}
