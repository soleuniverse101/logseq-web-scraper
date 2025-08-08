import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { ASTNode } from "./ast";
import { OutputNode } from "../interpreter";
import { convert } from "../data/conversions";

export type Block = Pick<BlockEntity, "content" | "uuid"> & {
  astNode: ASTNode;
  children: Block[];
};

export type ContentBlock = {
  content: string;
  children: ContentBlock[];
};

function contentFromOutput(outputNode: OutputNode): ContentBlock {
  const content = convert(outputNode.value, "String").value;
  if (outputNode.children.length == 0) {
    return { content, children: [] };
  } else {
    return { content, children: outputNode.children.map(contentFromOutput) };
  }
}

export function contentsFromOutput(outputNodes: OutputNode[]): ContentBlock[] {
  return outputNodes.map(contentFromOutput);
}
