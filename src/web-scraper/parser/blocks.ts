import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { Expr } from "./ast";

export type Block = Pick<BlockEntity, "content"> & {
  children: Block[];
  expr: Expr;
};
