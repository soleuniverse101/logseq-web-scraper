use std::collections::HashMap;

use scraper::Html;

use crate::ast::data::Value;

enum Variable {
    Defined(Value),
    Undefined,
}

pub struct Environment {
    variables: Vec<HashMap<String, Variable>>,
}

impl Environment {
    pub fn set_scope_root(&mut self, root: Html) {
        self.variables
            .last_mut()
            .expect("Environment shouldn't be out of scopes")
            .insert("_".to_string(), Variable::Defined(root.into()));
    }

    pub fn push_scope(&mut self) {
        self.variables.push(HashMap::new());
    }

    pub fn pop_scope(&mut self) {
        self.variables.pop();
    }

    pub fn new() -> Environment {
        let mut env = Environment {
            variables: Vec::new(),
        };
        env.push_scope();
        env
    }
}
