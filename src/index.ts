import type yargs from "yargs";

export type ExtractArgumentType<T> = T extends yargs.Argv<infer U> ? U : never;

export { commandModule as dbCommandModule } from "./commands/db";
export * from "./definitions";
export * from "./services/notion";
