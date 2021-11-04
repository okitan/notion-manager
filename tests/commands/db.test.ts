import yargs from "yargs";

import { dbCommandModule } from "../../src";

describe("commands/db", () => {
  test("works", () => {
    expect(yargs.command(dbCommandModule({ definitionsDir: "." }))).toMatchObject({});
  });
});
