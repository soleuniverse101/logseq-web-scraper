import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

type InstructionType = "block" | "list";

type ElementInputs = Pick<HTMLElement, "textContent"> & {
  pageTitle: string;
  pageURL: string;
};

interface Selector {
  cssSelector: string;
  externalSource?: URL;
}

export interface Instruction {
  type: InstructionType;
  selector: Selector;
  produceText: (inputs: ElementInputs) => string;
}

export const defaultProducer = (inputs: ElementInputs) => inputs.textContent;
export const defaultRootProducer = ({ pageTitle, pageURL }: ElementInputs) =>
  `[${pageTitle}](${pageURL})`;

export function parseInstruction(source: BlockEntity): Instruction {
  const { content } = source;
  const instruction = {} as Instruction;

  const lines = content.split("\n");
  const selectionLine = lines[0].split(" ");

  // Instruction type
  const typeWord = selectionLine[0].toLowerCase();
  let type: InstructionType;
  switch (typeWord) {
    case "list":
    case "block":
      type = typeWord;
      selectionLine.shift();
      break;
    default:
      type = "block";
      break;
  }
  instruction.type = type;

  //  Selector
  const selector = {} as Selector;
  const urlText = selectionLine[0];
  if (urlText) {
    try {
      selector.externalSource = new URL(urlText);
      selectionLine.shift();
    } catch {}
  }
  selector.cssSelector = selectionLine.join(" ");
  instruction.selector = selector;

  // Text producer
  if (lines.length > 0) {
    instruction.produceText = defaultProducer;
  } else {
    instruction.produceText = defaultProducer;
  }

  return instruction;
}
