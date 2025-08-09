import { wrapValue } from "../data";
import { createFunction, StandardFunction } from "../data/functions";
import { Environment } from "./environment";

const standardFunctions = {
  inc: createFunction(["Number"], "Number", ([n]) => n + 1),
} as const satisfies Record<string, StandardFunction>;

export function loadStandardFunctions(env: Environment) {
  for (const [name, func] of Object.entries(standardFunctions)) {
    env.loadReserved(name, wrapValue("Function", func));
  }
}
