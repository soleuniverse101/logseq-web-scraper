import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { ParsingResult } from ".";
import { ok } from "true-myth/result";
import { Expr } from "./ast";
import { parseExpr } from "./expressions";

interface Block {
  entity: BlockEntity;
}

type PartiallyParsedBlock = Block & {
  children: Block[];
  expr: Expr;
};

export type ParsedBlock = Omit<PartiallyParsedBlock, "children"> & {
  children: ParsedBlock;
};

function parseBlock(block: Block): PartiallyParsedBlock {
  const resultBlock = block as PartiallyParsedBlock;
  const { entity } = block;

  resultBlock.expr = parseExpr(entity.content);

  // Children to visit next
  resultBlock.children = [];
  if (entity.children) {
    for (const child of entity.children as BlockEntity[]) {
      resultBlock.children.push({ entity: child });
    }
  }

  return resultBlock;
}

export function parseRootBlock(root: BlockEntity): ParsingResult {
  const toVisit: Block[] = [{ entity: root }];

  function visit(): PartiallyParsedBlock | null {
    const block = toVisit.pop();
    if (!block) {
      return null;
    }

    toVisit.push(...parseBlock(block).children);

    return block as PartiallyParsedBlock;
  }

  const parsedRoot = visit()!;
  while (visit()) {}

  return ok(parsedRoot as unknown as ParsedBlock);
}
