import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

export const settings: SettingSchemaDesc[] = [
  {
    key: "googleApiKey",
    type: "string",
    title: "Google (Youtube) Data API Key",
    description:
      "Google account API Key to query Youtube data. The Youtube Data API must have been enabled on the account.",
    default: "",
  },
  {
    key: "webScraperStringConversionMaxCount",
    type: "number",
    title: "Web Scraper : String conversion max character count",
    description:
      "Maximum number of characters printed by default when converting HTML Elements to text.",
    default: 200,
  },
];
