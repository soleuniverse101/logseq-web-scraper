import { Value } from ".";
import { Environment } from "../interpreter/environment";

export type SystemCall = {
  type: "generateContext";
  contexts: { prepareEnv: (env: Environment) => void; value: Value }[];
};

type SystemCallType = SystemCall["type"];
type SystemCallFromType<Type extends SystemCallType> = Extract<
  SystemCall,
  { type: Type }
>;

export function sysCall<Type extends SystemCallType>(
  type: Type,
  info: Omit<SystemCallFromType<Type>, "type">,
): SystemCall {
  return { type, ...info };
}
