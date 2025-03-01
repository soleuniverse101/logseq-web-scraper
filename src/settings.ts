import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const settings: SettingSchemaDesc[] = [
  {
    key: "googleApiKey",
    type: "string",
    title: "Google (Youtube) Data API Key",
    description: "Google account API Key to query Youtube data. The Youtube Data API must have been enabled on the account.",
    default: ""
  }
];
