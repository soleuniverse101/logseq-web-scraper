import { BlockUUID } from "@logseq/libs/dist/LSPlugin.user";

export class BaseError extends Error {
  constructor(message: string, _block?: BlockUUID) {
    super(message);
  }
}
