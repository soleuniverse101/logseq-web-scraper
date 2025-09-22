import { SourceLineContext } from "../errors/parser-errors";

export type OutputNode = {
  content: string;
  children: OutputNode[];
  context: SourceLineContext;
};

export function outputNode(
  content: string,
  sourceContext: Readonly<SourceLineContext>,
  children: OutputNode[] = [],
): OutputNode {
  return { content, children, context: sourceContext };
}
