import { Result } from "neverthrow";

export function isResult(r: {}): r is Result<unknown, unknown> {
  return typeof r === "object" && r != null && "isErr" in r;
}
