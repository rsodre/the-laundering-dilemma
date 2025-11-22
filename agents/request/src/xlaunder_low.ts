import { config } from "dotenv";
import {
  decodeXPaymentResponse,
  wrapFetchWithPayment,
  createSigner,
  type Hex,
} from "x402-fetch";
import { Signer, isEvmSignerWallet } from 'x402/types';
import { _getBalance } from "./lib/wagmi";
import { sleep } from "./lib/misc";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;
const baseURL = "http://localhost:3000";
const endpointPath = "/entrypoints/launder_low/invoke";
const url = `${baseURL}${endpointPath}`;
console.log(`url: [${url}]`);

if (!baseURL || !privateKey || !endpointPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

/**
 * Demonstrates paying for a protected resource using x402-fetch.
 *
 * Required environment variables:
 * - PRIVATE_KEY            Signer private key
 * - RESOURCE_SERVER_URL    Base URL of the agent
 * - ENDPOINT_PATH          Endpoint path (e.g. /entrypoints/echo/invoke)
 */
async function main(): Promise<void> {
  // const signer = await createSigner("solana-devnet", privateKey); // uncomment for Solana
  const signer = await createSigner("base-sepolia", privateKey) as Signer;
  //@ts-ignore
  const signer_address = signer.account.address;

  // Get the USDC balance of signer on Base Sepolia
  // console.log("signer", signer_address);
  const balance_before = await _getBalance(signer_address);
  console.log(`USDC Balance on base-sepolia:`, balance_before);


  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);
  const response = await fetchWithPayment(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: {
        name: "Papito",
        account: "0x1234567890123456789012345678901234567890"
      }
    }),
  });
  if ( response.status !== 200 ) {
    console.error(`response >>>`, response);
    throw new Error(`Client fetch failed! status: ${response.status}`);
  }

  const body = await response.json();
  console.log(`body >>>`, body);

  const paymentResponse = decodeXPaymentResponse(
    response.headers.get("x-payment-response")!
  );
  // console.log(`paymentResponse >>>`, paymentResponse);

  // balance after...
  console.log(`wait...`);
  await sleep(2000);
  const balance_after = await _getBalance(signer_address);
  console.log(`USDC Balance on base-sepolia after request:`, balance_after);
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
