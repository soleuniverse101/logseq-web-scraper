import { ValueFromType } from "../../data";

export type ASTNode =
  | {
      type: "definition";
      identifier: ASTNodeFromType<"identifier">;
      right: ASTNode;
    }
  | {
      type: "binaryOp";
      left: ASTNode;
      operation: Operation;
      right: ASTNode;
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

export type ASTNodeType = ASTNode["type"];
export type ASTNodeFromType<Type extends ASTNodeType> = Extract<
  ASTNode,
  { type: Type }
>;
