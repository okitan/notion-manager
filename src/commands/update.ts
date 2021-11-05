import { buildPageParameters } from "@okitan/google-sheet-to-notion";
import { google } from "googleapis";
import path from "path";

import {
  addGoogleClientArguments,
  addNotionClientArguments,
  injectSheetsClient,
  listDefinitions,
  loadData,
  loadDefinition,
} from "..";

import type { CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import type yargs from "yargs";

import type { ExtractArgumentType, SheetsClientArgument } from "..";

export const command = "update <db> [Options]";
export const describe = "update notion with the data of google sheet";

function buildBuilder<T>({ definitionsDir, spreadsheetId }: { definitionsDir?: string; spreadsheetId?: string } = {}) {
  if (definitionsDir) {
    return (yargs: yargs.Argv<T>) =>
      addNotionClientArguments(
        addGoogleClientArguments(
          yargs
            .positional("db", { type: "string", choices: listDefinitions(definitionsDir), demandOption: true })
            .options({
              definitionsDir: { type: "string", default: path.resolve(definitionsDir), hidden: true },
              spreadsheetId: { type: "string", default: spreadsheetId, demandOption: true },
              sheetsClient: { default: google.sheets({ version: "v4" }), hidden: true }, // overridden by injectSheetsClient
              create: { type: "boolean", default: true },
              update: { type: "boolean", default: false },
              after: { type: "number", default: 1 },
              debug: { type: "boolean", default: false },
            })
        ).middleware([injectSheetsClient])
      );
  } else {
    return (yargs: yargs.Argv<T>) =>
      addNotionClientArguments(
        addGoogleClientArguments(
          yargs.positional("db", { type: "string", demandOption: true }).options({
            definitionsDir: { type: "string", demandOption: true },
            spreadsheetId: { type: "string", default: spreadsheetId, demandOption: true },
            sheetsClient: { default: google.sheets({ version: "v4" }), hidden: true }, // overridden by injectSheetsClient
            create: { type: "boolean", default: true },
            update: { type: "boolean", default: false },
            after: { type: "number", default: 1 },
            debug: { type: "boolean", default: false },
          })
        ).middleware([injectSheetsClient])
      );
  }
}

export function builder<T>(yargs: yargs.Argv<T>) {
  return buildBuilder()(yargs);
}

export async function handler({
  definitionsDir,
  db,
  spreadsheetId,
  sheetsClient,
  notionClient,
  create,
  update,
  after,
  debug,
}: yargs.Arguments<ExtractArgumentType<ReturnType<typeof builder>>>) {
  const schema = loadDefinition(definitionsDir, db);

  const data = await loadData({ spreadsheetId, definitionsDir, sheetsClient, name: db, schema });

  for (const i in data) {
    const index = parseInt(i, 10);
    if (index < after - 1) continue;
    const target = `${db}!A${index + 2}`;

    const datum = data[i];

    // TODO: building content

    if (!datum.$id) {
      const parameters = buildPageParameters({ data: data[i], schema }) as CreatePageParameters;
      if (debug) console.log(JSON.stringify(parameters.properties, null, 2));

      if (create) {
        console.log(`creating: ${datum.$title}(${target})`);

        const response = await notionClient.pages.create(parameters);

        await sheetsClient.spreadsheets.values.update({
          spreadsheetId,
          range: target,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[response.id]] },
        });
      }
    } else {
      const parameters = buildPageParameters({ data: data[i], schema }) as UpdatePageParameters;
      if (debug) console.log(JSON.stringify(parameters.properties, null, 2));

      if (update) {
        console.log(`updating ${datum.$id}: ${datum.$title}(${target})`);

        await notionClient.pages.update(parameters);
      }
    }
  }
}

export function commandModule({ definitionsDir, spreadsheetId }: { definitionsDir: string; spreadsheetId: string }) {
  return {
    command,
    describe,
    builder: buildBuilder({ definitionsDir, spreadsheetId }),
    handler,
  };
}
