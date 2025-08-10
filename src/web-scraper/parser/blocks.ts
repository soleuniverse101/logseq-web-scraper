import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { ASTNode } from "./ast";
import { OutputNode, RuntimeResult } from "../interpreter";
import { faillibleConvert } from "../data/conversions";
import { err, ok } from "neverthrow";

export type Block = Pick<BlockEntity, "content" | "uuid"> & {
  astNode: ASTNode;
  children: Block[];
};

export type ContentBlock = {
  content: string;
  children: ContentBlock[];
};

async function contentFromOutput(
  outputNode: OutputNode,
): RuntimeResult<ContentBlock> {
  const result = await faillibleConvert(
    outputNode.value,
    "String",
    outputNode.context,
  );
  if (result.isErr()) {
    return err(result.error);
  }
  const content = result.value.value;
  if (outputNode.children.length == 0) {
    return ok({ content, children: [] });
  } else {
    const childrenResult = await contentsFromOutput(outputNode.children);
    if (childrenResult.isErr()) {
      return err(childrenResult.error);
    }
    return ok({
      content,
      children: childrenResult.value,
    });
  }
}

export async function contentsFromOutput(
  outputNodes: OutputNode[],
): RuntimeResult<ContentBlock[]> {
  const contents: ContentBlock[] = [];
  for (const node of outputNodes) {
    const content = await contentFromOutput(node);
    if (content.isErr()) {
      return err(content.error);
    }
    contents.push(content.value);
  }
  return ok(contents);
}
