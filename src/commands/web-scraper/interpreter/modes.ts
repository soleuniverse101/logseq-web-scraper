export const modes = ["inline", "zip"] as const;
export type Modes = { [mode in (typeof modes)[number]]?: boolean };

export type Mode = NonNullable<keyof Modes>;
