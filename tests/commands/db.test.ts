import yargs from "yargs";

import { commandModule } from "../../src/commands/db";

describe("commands/db", () => {
  test("works", () => {
    expect(yargs.command(commandModule({ definitionsDir: "." }))).toMatchObject({});
  });
});
