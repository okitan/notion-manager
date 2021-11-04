import { Client } from "@notionhq/client";

import type yargs from "yargs";

export function addNotionCredentialsOptions<T>(yargs: yargs.Argv<T>) {
  return yargs.options({
    notionApiToken: {
      description: "token of notion",
      default: process.env["NODE_NOTION_API_TOKEN"] as string, // demandOption ensures this
      defaultDescription: "$NODE_NOTION_API_TOKEN",
      demandOption: true,
    },
  });
}

export function addNotionClientArguments<T>(yargs: yargs.Argv<T>) {
  return addNotionCredentialsOptions(yargs)
    .options({
      notionClient: {
        hidden: true,
        default: new Client({}), // this will overwritten by injectNotionClient
      },
    })
    .middleware(injectNotionClient);
}

export function injectNotionClient({ notionApiToken }: { notionApiToken: string }) {
  const notionClient = new Client({ auth: notionApiToken });

  return { notionClient };
}
