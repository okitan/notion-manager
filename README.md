# @okitan/notion-manager

yargs commands to sync google sheets to notion.

## Usage

```node
// without configuration
yargs.command(require("@okitan/notion-manager/lib/command/db"));

// with configuration
import { dbCommandModule } from "@okitan/notion-manager";

yargs.command(dbCommandModule({ desfinitionsDir: "./definitions" }));
```
