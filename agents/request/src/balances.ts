import { config } from "dotenv";
import {
  createSigner,
  type Hex,
} from "x402-fetch";
import { Signer } from 'x402/types';
import { formatCash, getBalance } from "libs/src";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;

async function main(): Promise<void> {
  // const signer = await createSigner("solana-devnet", privateKey); // uncomment for Solana
  const signer = await createSigner("base-sepolia", privateKey) as Signer;
  //@ts-ignore
  const signer_address = signer.account.address;

  const balance_sender = await getBalance(signer_address);
  console.log(`[Sender] USDC Balance on base-sepolia:`, balance_sender);

  const balance_receiver = await getBalance(process.env.PAYMENTS_RECEIVABLE_ADDRESS as string);
  console.log(`[Receiver] USDC Balance on base-sepolia:`, balance_receiver);
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});