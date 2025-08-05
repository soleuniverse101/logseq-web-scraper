import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { exprParserErr, ParserError } from "../../errors/parser-errors";
import { Block } from "./blocks";
import { ValueType } from "./data";
import { ok, Result } from "neverthrow";
import { parseExpr } from "./expressions";

export type ParsingResult = Result<Block[], ParserError[]>;

export class Parser {
  private result: Block[];
  private line = 1;

  constructor(rootBlocks: BlockEntity[]) {
    this.result = rootBlocks as unknown as Block[];
  }

  private parseBlock(block: Block, context: Context) {
    const expr = parseExpr(block.content);

    if (expr.isErr()) {
      throw exprParserErr(this.line++, expr.error);
    }

    block.expr = expr.value;
    for (const child of block.children) {
      this.parseBlock(child, context);
    }
  }

  public parse(): ParsingResult {
    if (this.result.length == 0) {
      throw new Error(
        "Parser is consumed after parsing. To parse multiple times, recreate a new Parser object each time.",
      );
    }
    const context = new Context();
    for (const block of this.result) {
      this.parseBlock(block, context);
    }
    return ok(this.result);
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
