type ReservedVariables = { _: HTMLDocument };
export const reservedVariables: string[] = ["_"] satisfies (keyof ReservedVariables)[];
