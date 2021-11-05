import { google, sheets_v4 } from "googleapis";

import { OAuth2ClientArguments } from "./google";

export type SheetsClientArgument = {
  sheetsClient: sheets_v4.Sheets;
};

export function injectSheetsClient({ oauth2Client }: OAuth2ClientArguments): SheetsClientArgument {
  return {
    sheetsClient: google.sheets({ version: "v4", auth: oauth2Client }),
  };
}
