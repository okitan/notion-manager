import type yargs from "yargs";

export type ExtractArgumentType<T> = T extends yargs.Argv<infer U> ? U : never;

export * from "./services/notion";
export { commandModule as dbCommandModule } from "./commands/db";
