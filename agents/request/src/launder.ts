import { config } from "dotenv";
import { fetcher } from "./lib/fetcher";

config();

const baseURL = "http://localhost:3100";
const endpointPath = "/entrypoints/launder/invoke";

async function main(): Promise<void> {
  const url = `${baseURL!}${endpointPath!}`;
  console.log(`url: [${url}]`);

  const output = await fetcher(url, {
    input: {
      // abstract: "Everything is calm, no activity during the past day."
      abstract: "The police is in high alert."
    }
  });
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
