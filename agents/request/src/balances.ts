import { config } from "dotenv";
import {
  createSigner,
  type Hex,
} from "x402-fetch";
import { Signer } from 'x402/types';
import { createAccount, formatCash, getBalance, getFundedAccount } from "libs/src";
import { Address } from "viem";
import { AUTHORITY_ACCOUNT_NAME } from "libs/src/constants";

config();

const privateKey = process.env.PRIVATE_KEY as Hex | string;

async function main(): Promise<void> {
  const funded_account = await getFundedAccount(privateKey as Address);
  const balance_funded = await getBalance(funded_account.address);
  console.log(`[FUNDED_ACCOUNT] USDC Balance on base-sepolia:`, balance_funded);

  const authority_account = await createAccount(AUTHORITY_ACCOUNT_NAME);
  const balance_authority = await getBalance(authority_account.address);
  console.log(`[AUTHORITY_ACCOUNT] USDC Balance on base-sepolia:`, balance_authority);

  const balance_receiver = await getBalance(process.env.PAYMENTS_RECEIVABLE_ADDRESS as Address);
  console.log(`[Receiver] USDC Balance on base-sepolia:`, balance_receiver);
}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});