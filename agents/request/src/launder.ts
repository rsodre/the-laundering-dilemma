import { config } from "dotenv";
import { fetcher } from "libs/src";
import { SyndicateLaunderInputType } from "libs/src/types";

config();

const baseURL = "http://localhost:3100";
const endpointPath = "/entrypoints/launder/invoke";

async function main(): Promise<void> {
  const url = `${baseURL!}${endpointPath!}`;
  console.log(`url: [${url}]`);

  const input: SyndicateLaunderInputType = {
    // abstract: "Everything is calm, no activity during the past day."
    // abstract: "The police is in high alert."
    abstract: "The police is in high alert. Every Syndicate member is being arrested!!! Do not launder any cash!"
  };

  const output = await fetcher(url, { input }, true);
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
