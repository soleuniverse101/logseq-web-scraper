import { ValueFromType } from "../../data";
import { Modes } from "../../interpreter/modes";

export type ASTNode = Readonly<
  | ({ template: BlockTemplate } & (
      | { type: "root"; url: URL }
      | {
          type: "block";
          selector: string;
          quantifier?: "?" | "+" | "*";
          modes: Modes;
        }
    ))
  | {
      type: "identifier";
      name: string;
    }
  | {
      type: "literal";
      value: ValueFromType<"Number" | "String">;
    }
>;

export type ASTNodeType = ASTNode["type"];
export type ASTNodeFromType<Type extends ASTNodeType> = Extract<
  ASTNode,
  { type: Type }
>;

export type ASTExpression = ASTNodeFromType<"identifier" | "literal">;
export function isExpression(node: ASTNode): node is ASTExpression {
  return ["identifier", "literal"].includes(node.type);
}

export type BlockTemplate = (string | ASTExpression | null)[];
