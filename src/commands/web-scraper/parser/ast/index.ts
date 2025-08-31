import { Modes } from "../../interpreter/modes";

export type ASTNode = Readonly<
  | { type: "root"; url: URL }
  | {
      type: "block";
      selector: string;
      quantifier?: "?" | "+" | "*";
      modes: Modes;
    }
>;

export type ASTNodeType = ASTNode["type"];
export type ASTNodeFromType<Type extends ASTNodeType> = Extract<
  ASTNode,
  { type: Type }
>;
