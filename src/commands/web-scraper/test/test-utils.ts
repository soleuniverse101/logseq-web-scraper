import { v4 as uuidv4 } from "uuid";
import { RawBlock } from "../parser/blocks";
import { Interpreter, RuntimeResult } from "../interpreter";
import { Parser } from "../parser";
import { SourceLineContext } from "../errors/parser-errors";
import { ok } from "neverthrow";
import { testPages } from "../examples/pages/testPages";

export function parseTestBlocks(src: string, indentLevel = 2): RawBlock[] {
  function getIndent(line: string) {
    for (let i = 0; i < line.length; i++) {
      if (line[i] != " ") {
        return i;
      }
    }
    return line.length;
  }

  function testBlock(content: string, children: RawBlock[] = []): RawBlock {
    return {
      content,
      uuid: uuidv4(),
      children,
    };
  }

  const rawLines = src.split("\n").map((line) => {
    const indent = getIndent(line);
    return [indent, line.substring(indent)] as const;
  });
  const blocks: RawBlock[] = [];
  let indent = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const [lineIndent, line] = rawLines[i];

    if (lineIndent % indentLevel != 0) {
      throw new Error(
        `Indents must be done with ${indentLevel} spaces and new lines of a block must follow directly after it with 1 space of indent`,
      );
    } else if (lineIndent > indent + indentLevel) {
      throw new Error("Cannot indent more than once at a time");
    }

    if (lineIndent < indent) {
      indent = lineIndent;
      continue;
    }

    let scope = blocks;
    for (let i = 0; i < lineIndent; i += indentLevel) {
      scope = scope[scope.length - 1].children;
    }

    const block = testBlock(line);

    scope.push(block);
    if (lineIndent > indent) {
      indent = indentLevel;
    }

    while (i + 1 < rawLines.length && rawLines[i + 1][0] == lineIndent + 1) {
      block.content += `\n${rawLines[++i][1]}`;
    }
  }

  return blocks;
}

export function testParse(src: string) {
  return Parser.parse(parseTestBlocks(src));
}

export function testInterpret(src: string) {
  const parsed = Parser.parse(parseTestBlocks(src));
  if (parsed.isErr()) {
    throw parsed.error;
  }
  return Interpreter.interpret(parsed.value, fetchPageTest);
}

export async function fetchPageTest(
  url: URL,
  _sourceContext: SourceLineContext,
): RuntimeResult<HTMLDocument> {
  const { pathname } = url;

  if (!(pathname in testPages)) {
    throw new Error(`Test URL ${pathname} not present in pages folder`);
  }

  return ok(Document.parseHTMLUnsafe(testPages[pathname]));
}
