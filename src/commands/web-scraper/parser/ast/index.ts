export type ASTNode = Readonly<
  | { type: "root"; url: URL }
  | {
      type: "block";
      selector: string;
      quantifier?: "?" | "+" | "*";
      modes: Mode[];
    }
>;

export type Mode = "inline" | "block";
