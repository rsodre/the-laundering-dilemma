import { config } from "dotenv";
import {
  decodeXPaymentResponse,
  wrapFetchWithPayment,
  createSigner,
  type Hex,
  type Signer,
} from "x402-fetch";
import { formatCash, sleep } from "./misc";
import { getBalance } from "./cdp";

config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as Hex | string;

/**
 * Demonstrates paying for a protected resource using x402-fetch.
 *
 * Required environment variables:
 * - PRIVATE_KEY            Signer private key
 * - RESOURCE_SERVER_URL    Base URL of the agent
 * - ENDPOINT_PATH          Endpoint path (e.g. /entrypoints/echo/invoke)
 */
export const xfetcher = async (url: string, input: any, privateKey?: Hex | undefined) => {
  const signer = await createSigner("base-sepolia", (privateKey ?? PRIVATE_KEY)!) as Signer;
  //@ts-ignore
  const signer_address = signer.account.address;

  // Get the USDC balance of signer on Base Sepolia
  // console.log(">>> signer", signer_address);
  const balance_before = await getBalance(signer_address);
  // console.log(`USDC Balance on base-sepolia:`, balance_before);
  console.log(`[USDC] Balance before:`, balance_before.formatted_cash);

  //@ts-ignore
  const fetchWithPayment = wrapFetchWithPayment(fetch, signer);
  const response = await fetchWithPayment(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
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
  const balance_after = await getBalance(signer_address);
  // console.log(`USDC Balance on base-sepolia after request:`, balance_after);
  console.log(`[USDC] Balance after:`, balance_after.formatted_cash);

  const difference = (balance_after.balance - balance_before.balance);
  console.log(`[USDC] Difference:`, formatCash(difference));

  return body.output;
}
