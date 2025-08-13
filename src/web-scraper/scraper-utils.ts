import { Result } from "neverthrow";

export function isResult(r: unknown): r is Result<unknown, unknown> {
  return typeof r === "object" && r != null && "isErr" in r;
}
