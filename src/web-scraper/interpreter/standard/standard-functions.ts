import { wrapValue } from "../../data";
import { StandardFunction } from "../../data/functions";
import { Environment } from "../environment";
import { impureFetch, pureFetch } from "./fetch";
import { impureSelectList, pureSelectList } from "./select-list";
import { impureSelect, pureSelect } from "./select";

const standardFunctions = {
  fetch: pureFetch,
  "fetch!": impureFetch,
  select: pureSelect,
  "select!": impureSelect,
  selectList: pureSelectList,
  "selectList!": impureSelectList,
} as const satisfies Record<string, StandardFunction>;

export function loadStandardFunctions(env: Environment) {
  for (const [name, func] of Object.entries(standardFunctions)) {
    env.loadReserved(name, wrapValue("StandardFunction", func));
  }
}
