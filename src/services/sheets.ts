import { google, type sheets_v4 } from "googleapis";

import type { OAuth2ClientArguments } from "./google";

export type SheetsClientArgument = {
  sheetsClient: sheets_v4.Sheets;
};

export function injectSheetsClient(args: OAuth2ClientArguments & SheetsClientArgument): void {
  args.sheetsClient = google.sheets({ version: "v4", auth: args.oauth2Client });
}
