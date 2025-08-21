/**
 * Debugging type that will display a fully resolved type
 * in Intellisense instead of just the type aliases
 * (CREDIT : https://www.reddit.com/r/typescript/comments/sglwk6/how_to_troubleshoot_types/)
 *
 * @type {T} The type to expand out
 */
export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
    ? T extends infer O
      ? { [K in keyof O]: ExpandRecursively<O[K]> }
      : never
    : T;
