import { wrapValue } from "../../data";
import { StandardFunction } from "../../data/functions";
import { Environment } from "../environment";
import { impureFetch, pureFetch } from "./fetch";
import { inlineSelect } from "./inline-select";
import { select } from "./select";

const standardFunctions = {
  fetch: pureFetch,
  "fetch!": impureFetch,
  select,
  "$select": inlineSelect,
} as const satisfies Record<string, StandardFunction>;

export function loadStandardFunctions(env: Environment) {
  for (const [name, func] of Object.entries(standardFunctions)) {
    env.loadReserved(name, wrapValue("StandardFunction", func));
  }
}
