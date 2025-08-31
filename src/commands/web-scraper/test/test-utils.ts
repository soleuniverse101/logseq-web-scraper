import { v4 as uuidv4 } from "uuid";
import { RawBlock } from "../parser/blocks";
import { Interpreter } from "../interpreter";
import { Parser } from "../parser";

export function parseTestBlocks(src: string, indentLevel = 2): RawBlock[] {
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

  const blocks: RawBlock[] = [];
  let indent = 0;

  for (const line of src.split("\n")) {
    const lineIndent = getIndent(line);

    if (lineIndent % indentLevel != 0) {
      throw new Error(`Indents must be done with ${indentLevel} spaces`);
    } else if (lineIndent > indent + indentLevel) {
      throw new Error("Cannot indent more than once at a time");
    }

    const block = testBlock(line.substring(lineIndent));

    if (lineIndent < indent) {
      indent = lineIndent;
      continue;
    }

    let scope = blocks;
    for (let i = 0; i < lineIndent; i += indentLevel) {
      scope = scope[scope.length - 1].children;
    }

    scope.push(block);
    if (lineIndent > indent) {
      indent += indentLevel;
    }
  }

  return blocks;
}

export function testParse(src: string) {
  return Parser.parse(parseTestBlocks(src));
}

export function testInterpret(src: string) {
  return Interpreter.interpret(
    Parser.parse(parseTestBlocks(src))._unsafeUnwrap(),
  );
}
