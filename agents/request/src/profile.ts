import { config } from "dotenv";
import { fetcher } from "libs/src";

config();

const baseURL = "http://localhost:3100";
const endpointPath = "/entrypoints/profile/invoke";

async function main(): Promise<void> {
  const url = `${baseURL!}${endpointPath!}`;
  console.log(`url: [${url}]`);

  const output = await fetcher(url, {
    input: {}
  });
  console.log(`output >>>`, output);
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
