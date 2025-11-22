import { CdpClient } from "@coinbase/cdp-sdk";
import { Address, erc20Abi, formatUnits } from 'viem'
import { bigintEquals, formatCash } from './misc';

//
// based on:
// https://docs.cdp.coinbase.com/data/token-balance/cdp-sdk#example
//
// bun i @coinbase/cdp-sdk
//

const cdp = new CdpClient();
const network = "base-sepolia";  // Base mainnet

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
