import { readdirSync } from "fs";

import type { UpdateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

export function listDefinitions(dir: string): string[] {
  return readdirSync(dir)
    .filter((e) => e.endsWith(".js") || e.endsWith(".ts"))
    .map((e) => e.split(".")[0]);
}

export function loadDefinition(dir: string, name: string): UpdateDatabaseParameters {
  return require(`${dir}/${name}`).schema;
}

export function loadDefinitionByDatabaseId({
  dir,
  id,
}: {
  dir: string;
  id: string;
}): UpdateDatabaseParameters | undefined {
  for (const name of listDefinitions(dir)) {
    const parameter = loadDefinition(dir, name);

    if (parameter.database_id === id.replace(/-/g, "")) return parameter;
  }

  return;
}
