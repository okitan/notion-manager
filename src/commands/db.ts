import path from "path";

import { listDefinitions, loadDefinition } from "../definitions";
import { addNotionClientArguments } from "../services/notion";

import type yargs from "yargs";

import type { ExtractArgumentType } from "../";

export const command = "db <db> [Options]";
export const describe = "maintain db";

function buildBuilder<T>({ definitionsDir }: { definitionsDir?: string } = {}) {
  if (definitionsDir) {
    return (yargs: yargs.Argv<T>) =>
      addNotionClientArguments(
        yargs
          .positional("db", {
            type: "string",
            choices: listDefinitions(path.resolve(definitionsDir)),
            demandOption: true,
          })
          .options({ definitionsDir: { type: "string", default: path.resolve(definitionsDir), hidden: true } })
      );
  } else {
    return (yargs: yargs.Argv<T>) =>
      addNotionClientArguments(
        yargs
          .positional("db", { type: "string", demandOption: true })
          .options({ definitionsDir: { type: "string", demandOption: true } })
      );
  }
}

export function builder<T>(yargs: yargs.Argv<T>) {
  return buildBuilder()(yargs);
}

export async function handler({
  definitionsDir,
  db,
  notionClient,
}: yargs.Arguments<ExtractArgumentType<ReturnType<typeof builder>>>): Promise<void> {
  const parameters = loadDefinition(definitionsDir, db);

  const response = await notionClient.databases.update(parameters);

  console.log(
    `Successfully updated database ${parameters.database_id}:
${Object.entries(response.properties)
  .map(([key, value]) => `${key}: ${value.type}`)
  .join("\n")}`
  );
}

export function commandModule({ definitionsDir }: { definitionsDir: string }) {
  return {
    command,
    describe,
    builder: buildBuilder({ definitionsDir }),
    handler,
  };
}
