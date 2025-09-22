import { RuntimeResult } from "..";
import { Environment } from "../environment";
import { OutputNode } from "../output";

export type Context = {
  /**
   * Called to prepare the environment for the context's children's execution.
   * @param env
   */
  prepare?: (env: Environment) => RuntimeResult<void>;
  /**
   * Is called after all childrens were executed and can affect their output.
   * @param env environment enclosing the parent context and its children
   */
  execute: (
    env: Environment,
    childrenOutput: OutputNode[],
  ) => RuntimeResult<string | void>;
};
export type Contexts = Context[];
