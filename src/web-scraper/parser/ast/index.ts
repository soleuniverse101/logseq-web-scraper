import { ValueFromType } from "../../data";

export type ASTNode = Readonly<
  | {
      type: "definition";
      identifier: ASTNodeFromType<"identifier">;
      right: ASTNode;
    }
  | { type: "object"; mappings: { key: string; value: ASTNode }[] }
  | { type: "array"; elements: ASTNode[] }
  | {
      type: "lambda";
      parameters: ASTNodeFromType<"identifier">[];
      body: Exclude<ASTNode, ASTNodeFromType<"definition">>;
    }
  | { type: "functionCall"; callee: ASTNode; args: ASTNode[] }
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
    }
>;

export type Operation = "+" | "-" | "*" | "/";

export type ASTNodeType = ASTNode["type"];
export type ASTNodeFromType<Type extends ASTNodeType> = Extract<
  ASTNode,
  { type: Type }
>;
