import { err, ok, Result } from "neverthrow";
import { astParsingErr, ParserError } from "../errors/parser-errors";
import { parseASTNode } from "./ast/parser";
import { Block, RawBlock } from "./blocks";

export type ParsingResult = Result<Block[], ParserError>;

export class Parser {
  private result: Block[];
  private line = 1;

  private constructor(rootBlocks: RawBlock[]) {
    this.result = rootBlocks as unknown as Block[];
  }

  private parseBlock(block: Block): Result<void, ParserError> {
    const astNode = parseASTNode(block.content);

    if (astNode.isErr()) {
      return astParsingErr(astNode.error, {
        blockUUID: block.uuid,
        blockLine: this.line,
      });
    }

    block.astNode = astNode.value;

    this.line++;
    for (const child of block.children) {
      const result = this.parseBlock(child);
      if (result.isErr()) {
        return err(result.error);
      }
    }

    return ok();
  }

  public static parse(rootBlocks: RawBlock[]): ParsingResult {
    const parser = new Parser(rootBlocks);

    for (const block of parser.result) {
      const result = parser.parseBlock(block);
      if (result.isErr()) {
        return err(result.error);
      }
    }

    return ok(parser.result);
  }
}
