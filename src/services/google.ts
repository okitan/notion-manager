import { Auth } from "googleapis";
import yargs from "yargs";

export type OAuth2ClientArguments = {
  oauth2Client: Auth.OAuth2Client;
};

export function addGoogleCredentialsOptions<T>(yargs: yargs.Argv<T>) {
  return yargs.options({
    googleClientId: {
      description: "client_id of google",
      default: process.env["NODE_GOOGLE_CLIENT_ID"] as string, // demandOption ensures this
      defaultDescription: "$NODE_GOOGLE_CLIENT_ID",
      demandOption: true,
    },
    googleClientSecret: {
      description: "client_secret of google",
      default: process.env["NODE_GOOGLE_CLIENT_SECRET"] as string, // demandOption ensures this
      defaultDescription: "$NODE_GOOGLE_CLIENT_SECRET",
      demandOption: true,
    },
    googleRefreshToken: {
      description: "refresh_token of google",
      default: process.env["NODE_GOOGLE_REFRESH_TOKEN"] as string, // demandOption ensures this
      defaultDescription: "$NODE_GOOGLE_REFRESH_TOKEN",
      demandOption: true,
    },
  });
}

export function addGoogleClientArguments<T>(yargs: yargs.Argv<T>) {
  return addGoogleCredentialsOptions(yargs)
    .options({
      oauth2Client: {
        hidden: true,
        default: new Auth.OAuth2Client(), // overwritten by middleware
      },
    })
    .middleware(injectOAuth2Client);
}

export function injectOAuth2Client({
  googleClientId,
  googleClientSecret,
  googleRefreshToken,
}: {
  googleClientId: string;
  googleClientSecret: string;
  googleRefreshToken: string;
}): OAuth2ClientArguments {
  const oauth2Client = new Auth.OAuth2Client(googleClientId, googleClientSecret);
  oauth2Client.credentials = { refresh_token: googleRefreshToken };

  return { oauth2Client };
}
