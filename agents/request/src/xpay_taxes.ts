import { config } from "dotenv";
import { fetcher } from "./lib/fetcher";

config();

const baseURL = "http://localhost:3000";
const endpointPath = "/entrypoints/pay_taxes/invoke";

async function main(): Promise<void> {
  const url = `${baseURL!}${endpointPath!}`;
  console.log(`url: [${url}]`);

  const output = await fetcher(url, {
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
