import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { ASTNode } from "./ast";
import { OutputNode } from "../interpreter";

export type RawBlock = Pick<BlockEntity, "content" | "uuid"> & {
  children: RawBlock[];
};
export type Block = Omit<RawBlock, "children"> & {
  astNode: ASTNode;
  children: Block[];
};

export type ContentBlock = {
  content: string;
  children: ContentBlock[];
};

export function contentsFromOutput(outputNodes: OutputNode[]): ContentBlock[] {
  const contents: ContentBlock[] = [];
  for (const { content, children } of outputNodes) {
    contents.push({ content, children: contentsFromOutput(children) });
  }
  return contents;
}
