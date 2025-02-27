import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const settings: SettingSchemaDesc[] = [
  {
    key: "googleApiKey",
    type: "string",
    title: "Google (Youtube) Data API Key",
    description: "API Key to query Youtube data",
    default: ""
  }
];
