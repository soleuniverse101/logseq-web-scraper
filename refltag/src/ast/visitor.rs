use crate::{
    ast::expressions::{Expr, Fetch},
    interpreter::OutputBlock,
};

pub trait InterpretExpr {
    fn interpret_fetch(&mut self, fetch: &Fetch) -> Vec<OutputBlock>;
}

impl Expr {
    pub fn interpret(&self, interpreter: &mut impl InterpretExpr) -> Vec<OutputBlock> {
        match self {
            Expr::Fetch(fetch) => interpreter.interpret_fetch(fetch),
        }
    }
}
