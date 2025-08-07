import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { ok, Result } from "neverthrow";
import { ValueType } from "../data";
import { exprParserErr, ParserError } from "../errors/parser-errors";
import { parseASTNode } from "./ast/parser";
import { Block } from "./blocks";

export type ParsingResult = Result<Block[], ParserError[]>;

export class Parser {
  private result: Block[];
  private line = 1;

  private constructor(rootBlocks: BlockEntity[]) {
    this.result = rootBlocks as unknown as Block[];
  }

  private parseBlock(block: Block, context: Context) {
    const expr = parseASTNode(block.content);

    if (expr.isErr()) {
      throw exprParserErr(this.line, expr.error);
    }

    block.expr = expr.value;

    this.line++;
    for (const child of block.children) {
      this.parseBlock(child, context);
    }
  }

  public static parse(rootBlocks: BlockEntity[]): ParsingResult {
    const parser = new Parser(rootBlocks);
    const context = new Context();

    for (const block of parser.result) {
      parser.parseBlock(block, context);
    }

    return ok(parser.result);
  }
}

class Context {
  private variables: Map<String, ValueType> = new Map();
  private parent: Context | null = null;

  public define(name: string, type: ValueType) {
    this.variables.set(name, type);
  }

  public isDefined(name: string) {
    let context: Context | null = this;

    while (context) {
      if (context.isDefined(name)) {
        return true;
      }
      context = context.parent;
    }

    return false;
  }

  public isRoot(): boolean {
    return this.parent == null;
  }

  public extendScope() {
    let context = new Context();
    context.parent = this;
    return context;
  }
}
