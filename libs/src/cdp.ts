import { CdpClient, EvmServerAccount } from "@coinbase/cdp-sdk";
import { Address, formatUnits } from 'viem'
import { bigintEquals, formatCash } from './misc';
import { FUNDED_ACCOUNT_NAME } from "./constants";

//---------------------------------------------------------
// Coinbase CDP SDK integration
//
// bun i @coinbase/cdp-sdk
//

const cdp = new CdpClient();
const NETWORK = "base-sepolia";  // Base mainnet

// USDC Contract Addresses
// https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ADDRESS_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";


//---------------------------------------------------------
// Create server wallet
//
// https://docs.cdp.coinbase.com/server-wallets/v2/introduction/quickstart
// https://docs.cdp.coinbase.com/server-wallets/v2/using-the-wallet-api/managing-accounts#evm-accounts
//
export const getServerAccount = async (accountName: string): Promise<EvmServerAccount> => {
  const account: EvmServerAccount = await cdp.evm.getOrCreateAccount({
    name: accountName,
  });
  console.log(`>>> [Wallet] for [${accountName}]:`, account.address);
  return account;
}
export const exportAccountKey = async (accountName: string): Promise<string> => {
  let privateKey = await cdp.evm.exportAccount({
    name: accountName
  })
  console.log(`>>> [Private Key] for [${accountName}]:`, Boolean(privateKey));
  return `0x${privateKey}`;
}

//
// this is an imported funded wallet used for all funding needs
export const getFundedAccount = async (privateKey: Address) => {
  let account: EvmServerAccount;
  try {
    account = await cdp.evm.importAccount({
      privateKey,
      name: FUNDED_ACCOUNT_NAME,
    });
  } catch (error) {
    account = await cdp.evm.getOrCreateAccount({
      name: FUNDED_ACCOUNT_NAME,
    });
  }
  return account;
}



//---------------------------------------------------------
// Get balance of an account
// https://docs.cdp.coinbase.com/data/token-balance/cdp-sdk#example
//

export const getBalance = async (address: Address) => {
  const result = await cdp.evm.listTokenBalances({
    address,
    network: NETWORK,
  });

  // console.log(result?.balances)
  const balance =
    result?.balances
      .find(b => bigintEquals(b.token.contractAddress, USDC_ADDRESS_SEPOLIA))?.amount.amount ?? 0n;

  let name: string | undefined;
  try {
    name = (await cdp.evm.getAccount({ address })).name;
  } catch (error) {}

  return {
    name,
    address,
    balance,
    formatted: formatUnits(balance, 6),
    formatted_cash: formatCash(balance),
  }
}


//---------------------------------------------------------
// Fund account with USDC
// https://docs.cdp.coinbase.com/data/token-balance/cdp-sdk#example
//
export const fundSyndicate = async (privateKey: Address, receiver: EvmServerAccount, amount: bigint) => {
  const sender = await getFundedAccount(privateKey);
  console.log(`>>> [Funded Account] balance:`, await getBalance(sender.address));
  await sender.transfer({
    to: receiver,
    amount,
    token: USDC_ADDRESS_SEPOLIA,
    network: NETWORK,
  })
}

export const transferCash = async (senderName: string, receiverName: string, amount: bigint) => {
  const sender = await cdp.evm.getOrCreateAccount({
    name: senderName,
  });
  const receiver = await cdp.evm.getOrCreateAccount({
    name: receiverName,
  });
  await sender.transfer({
    to: receiver,
    amount,
    token: USDC_ADDRESS_SEPOLIA,
    network: NETWORK,
  })
}
