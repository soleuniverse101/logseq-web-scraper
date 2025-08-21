import { Result } from "neverthrow";

export function isResult(r: unknown): r is Result<unknown, unknown> {
  return typeof r === "object" && r != null && "isErr" in r;
}

export function zip<T extends unknown[][]>(
  ...arrays: T
): { [Index in keyof T]: T[Index][number] }[] {
  const length = arrays.reduce(
    (previous, current: any[]) => Math.min(previous, current.length),
    Number.MAX_SAFE_INTEGER,
  );
  const result: any[] = [];
  for (let i = 0; i < length; i++) {
    const current: any[] = [];
    for (let j = 0; j < arrays.length; j++) {
      current.push(arrays[j][i]);
    }
    result.push(current);
  }
  return result;
}

