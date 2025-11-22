import { config } from "dotenv";
import { Strategy, LAUNDROMATS } from "libs/src/constants";
import { xfetcher } from 'libs/src';

config();

const baseURL = `http://localhost:3000`;
const endpointPath = `/entrypoints/${LAUNDROMATS[Strategy.Aggressive].endpoint}/invoke`;

async function main(): Promise<void> {
  const url = `${baseURL!}${endpointPath!}`;
  console.log(`url: [${url}]`);

  const output = await xfetcher(url, {
    input: {
      name: "Papito",
      account: "0x1234567890123456789012345678901234567890"
    }
  });
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
