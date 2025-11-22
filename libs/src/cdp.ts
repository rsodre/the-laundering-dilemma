import { CdpClient, EvmServerAccount } from "@coinbase/cdp-sdk";
import { Address, formatUnits } from 'viem'
import { bigintEquals, formatCash } from './misc';

//---------------------------------------------------------
// Coinbase CDP SDK integration
//
// bun i @coinbase/cdp-sdk
//

const cdp = new CdpClient();
const network = "base-sepolia";  // Base mainnet


//---------------------------------------------------------
// Get balance of an account
// https://docs.cdp.coinbase.com/data/token-balance/cdp-sdk#example
//

// USDC Contract Addresses
// https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ADDRESS_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export const getBalance = async (account: Address) => {
  const result = await cdp.evm.listTokenBalances({
    address: account,
    network: network,
  });

  // console.log(result?.balances)
  const balance =
    result?.balances
      .find(b => bigintEquals(b.token.contractAddress, USDC_ADDRESS_SEPOLIA))?.amount.amount ?? 0n;

  return {
    account,
    balance,
    formatted: formatUnits(balance, 6),
    formatted_cash: formatCash(balance),
  }
}


//---------------------------------------------------------
// Create server wallet
//
// https://docs.cdp.coinbase.com/server-wallets/v2/introduction/quickstart
// https://docs.cdp.coinbase.com/server-wallets/v2/using-the-wallet-api/managing-accounts#evm-accounts
//
export const createAccount = async (accountName: string): Promise<Address> => {
  const account: EvmServerAccount = await cdp.evm.getOrCreateAccount({
    name: accountName,
  });
  console.log(`>>> [Wallet] for [${accountName}]:`, account.address);
  return account.address;
}
export const exportAccountKey = async (accountName: string): Promise<string> => {
  let privateKey = await cdp.evm.exportAccount({
    name: accountName
  })
  console.log(`>>> [Private Key] for [${accountName}]:`, Boolean(privateKey));
  return privateKey;
}
