import { Datum, parseData } from "@okitan/google-sheet-to-notion";
import { sheets_v4 } from "googleapis";

import { loadDefinitionByDatabaseId } from ".";

import type { UpdateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import type yargs from "yargs";

export type ExtractArgumentType<T> = T extends yargs.Argv<infer U> ? U : never;

export { commandModule as dbCommandModule } from "./commands/db";
export { commandModule as updateCommandModule } from "./commands/update";
export * from "./definitions";
export * from "./services/google";
export * from "./services/notion";
export * from "./services/sheets";

type RelationProperty = {
  type: "relation";
  relation: {
    database_id: string;
    synced_property_id: string;
    synced_property_name: string;
  };
  id: string;
  name: string;
};

export async function loadData({
  spreadsheetId,
  definitionsDir,
  sheetsClient,
  name,
  schema,
}: {
  spreadsheetId: string;
  definitionsDir: string;
  sheetsClient: sheets_v4.Sheets;
  name: string;
  schema: UpdateDatabaseParameters;
}): Promise<Datum[]> {
  const data = parseData({
    data: await (await sheetsClient.spreadsheets.values.get({ spreadsheetId, range: name })).data,
    schema,
  });

  const properties = schema.properties;
  if (!properties) return data;

  // resolve relation
  const relations = Object.entries(properties).filter((keyAndValue): keyAndValue is [string, RelationProperty] =>
    Boolean(keyAndValue[1] && "relation" in keyAndValue[1])
  );

  for (const [key, relation] of relations) {
    const target = loadDefinitionByDatabaseId({ dir: definitionsDir, id: relation.relation.database_id });
    if (!target) {
      console.error(`cannot find relation: ${relation.relation.database_id}`);
      data.forEach((datum) => (datum[key] = []));
      continue;
    }

    const relationData = await loadData({ spreadsheetId, definitionsDir, sheetsClient, name: key, schema: target });

    data.forEach((datum) => {
      datum[key] = ((datum[key] as string[]) || []).map((title) => {
        const found = relationData.find((e) => e.$title === title);
        if (!found) throw new Error(`cannot find relation ${datum[key]} of ${key} at ${datum.$title}`);
        if (!found.$id) throw new Error(`page is not created ${found.$title}`);

        return found.$id;
      });
    });
  }

  return data;
}
