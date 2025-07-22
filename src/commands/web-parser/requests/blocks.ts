import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import {
    defaultProducer,
    defaultRootProducer,
    Instruction,
    parseInstruction,
} from "./instructions";

interface Block {
  entity: BlockEntity;
}

type PartiallyParsedBlock = Block & {
  children: Block[];
  instruction: Instruction;
};

export type ParsedBlock = Omit<PartiallyParsedBlock, "children"> & {
  children: ParsedBlock;
};

function parseBlock(block: Block): PartiallyParsedBlock {
  const resultBlock = block as PartiallyParsedBlock;
  const { entity } = block;

  resultBlock.instruction = parseInstruction(entity);

  // Children to visit next
  resultBlock.children = [];
  if (entity.children) {
    for (const child of entity.children as BlockEntity[]) {
      resultBlock.children.push({ entity: child });
    }
  }

  return resultBlock;
}

export function parseRootBlock(root: BlockEntity): ParsedBlock {
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

  if (parsedRoot.instruction.produceText == defaultProducer) {
    parsedRoot.instruction.produceText = defaultRootProducer;
  }

  return parsedRoot as unknown as ParsedBlock;
}
