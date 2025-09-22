export type Modes = { inline?: boolean; zip?: boolean };

export type Mode = NonNullable<keyof Modes>;
