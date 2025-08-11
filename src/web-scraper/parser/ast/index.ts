import { ValueFromType } from "../../data";
import { Operation } from "../../interpreter/operations";

export type ASTNode = Readonly<
  | {
      type: "definition";
      identifier: ASTNodeFromType<"identifier">;
      right: ASTNode;
    }
  | {
      type: "propertyAccess";
      object: Expression;
      property: ASTNodeFromType<"identifier">;
    }
  | { type: "functionCall"; callee: ASTNode; args: ASTNode[] }
  | {
      type: "lambda";
      parameters: ASTNodeFromType<"identifier">[];
      body: Expression;
    }
  | { type: "object"; mappings: { key: string; value: ASTNode }[] }
  | { type: "array"; elements: ASTNode[] }
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

type Expression = ASTNodeFromType<
  | "object"
  | "array"
  | "lambda"
  | "functionCall"
  | "propertyAccess"
  | "binaryOp"
  | "identifier"
  | "literal"
>;

export type ASTNodeType = ASTNode["type"];
export type ASTNodeFromType<Type extends ASTNodeType> = Extract<
  ASTNode,
  { type: Type }
>;
