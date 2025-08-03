use chumsky::{
    prelude::*,
    text::{ascii::keyword, inline_whitespace, newline},
};

use crate::{
    ast::expressions::{Expr, Fetch},
    parser::helpers,
};

pub fn expr<'src>() -> impl Parser<'src, &'src str, Expr> {
    fetch()
}

pub fn fetch<'src>() -> impl Parser<'src, &'src str, Expr> {
    keyword("fetch")
        .ignore_then(helpers::url().padded_by(inline_whitespace()))
        .then(
            newline()
                .ignore_then(any().repeated().at_least(1).to_slice())
                .or_not(),
        )
        .map(|(url, text)| {
            Expr::Fetch(Fetch {
                url,
                text: text.map(ToString::to_string),
            })
        })
}
