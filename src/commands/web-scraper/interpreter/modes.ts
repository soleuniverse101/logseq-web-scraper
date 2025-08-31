export type Modes = { context?: "inline" | "block" };

export type Mode = NonNullable<Modes[keyof Modes]>;
