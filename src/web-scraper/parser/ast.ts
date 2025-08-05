export type BlockExpr = { content: string } & Expr;
export type Expr = {
  type: "fetch";
  url: URL;
};
