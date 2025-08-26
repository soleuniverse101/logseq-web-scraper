import { RawBlock } from "../parser/blocks";
import { v4 as uuidv4 } from "uuid";

const INDENT_LEVEL = 2;

export function parseTestBlock(src: string): RawBlock[] {
  const blocks: RawBlock[] = [];
  let indent = 0;

  for (const line of src.split("\n")) {
    const lineIndent = getIndent(line);

    if (lineIndent % INDENT_LEVEL != 0) {
      throw new Error(`Indents must be done with ${INDENT_LEVEL} spaces`);
    } else if (lineIndent > indent + INDENT_LEVEL) {
      throw new Error("Cannot indent more than once at a time");
    }

    const block = testBlock(line.substring(lineIndent));

    if (lineIndent == indent) {
      let scope = blocks;
      for (let i = 0; i < lineIndent; i += INDENT_LEVEL) {
        scope = blocks[blocks.length - 1].children;
      }
      scope.push(block);
    } else if (lineIndent == indent + INDENT_LEVEL) {
      blocks[blocks.length - 1].children.push(block);
      indent += INDENT_LEVEL;
    } else {
      for (let i = 0; i < indent - lineIndent; i += INDENT_LEVEL) {
        indent -= INDENT_LEVEL;
      }
    }
  }

  return blocks;
}

function getIndent(line: string) {
  let indent = 0;
  for (const c of line) {
    if (c == " ") {
      indent++;
    } else {
      return indent;
    }
  }
  return indent;
}

function testBlock(content: string, children: RawBlock[] = []): RawBlock {
  return {
    content,
    uuid: uuidv4(),
    children,
  };
}
