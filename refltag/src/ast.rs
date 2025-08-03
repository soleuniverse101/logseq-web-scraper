pub mod expressions;
pub mod parsers;
pub mod visitor;
pub mod data;

use crate::{ast::expressions::Expr, logseq::LogseqBlock};

#[derive(Debug)]
pub struct ParsedBlock {
    pub source: LogseqBlock,
    pub expr: Expr,
}
