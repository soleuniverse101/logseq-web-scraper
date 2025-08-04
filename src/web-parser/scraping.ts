import { ParsedBlock } from "./requests/blocks";

type ScrapedBlock = ParsedBlock & {
  source: HTMLElement;
};

export function scrap(block: ParsedBlock): ScrapedBlock {
  const parsedBlock = block as ScrapedBlock;

  if ()

  return parsedBlock;
}
