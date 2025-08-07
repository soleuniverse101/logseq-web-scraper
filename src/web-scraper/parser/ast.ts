import { ValueFromType } from "./data";

export type Expr =
  | {
      type: "binaryOp";
      left: Expr;
      operation: Operation;
      right: Expr;
    }
  | {
      type: "identifier";
      name: string;
    }
  | {
      type: "literal";
      value: ValueFromType<"Number" | "String">;
    };

export type Operation = "+" | "-" | "*" | "/";

export type ExprType = Expr["type"];
export type ExprFromType<Type extends ExprType> = Extract<Expr, { type: Type }>;
