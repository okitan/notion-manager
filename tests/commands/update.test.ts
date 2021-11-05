import yargs from "yargs";

import { updateCommandModule } from "../../src";

describe("commands/db", () => {
  test("works", () => {
    expect(yargs.command(updateCommandModule({ spreadsheetId: "", definitionsDir: "." }))).toMatchObject({});
  });
});
