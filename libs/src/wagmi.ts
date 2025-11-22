import { createConfig, http, readContract } from '@wagmi/core'
import { base, baseSepolia } from '@wagmi/core/chains'
import { erc20Abi, formatUnits } from 'viem'
import { formatCash } from './misc';

//
// wagmi setup:
// https://wagmi.sh/core/getting-started
//
// bun add @wagmi/core @wagmi/connectors viem@2.x
//

export const config = createConfig({
  chains: [
    // base,
    baseSepolia,
  ],
  transports: {
    // [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})

// USDC Contract Addresses
// https://developers.circle.com/stablecoins/usdc-contract-addresses
const USDC_ADDRESS_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export const getBalance = async (account: string) => {
  const result = await readContract(config, {
    abi: erc20Abi,
    address: USDC_ADDRESS_SEPOLIA,
    functionName: 'balanceOf',
    args: [account as `0x${string}`],
  }) as bigint;
  return {
    account,
    balance: result,
    // formatted: formatUnits(result, 6),
    formatted: formatCash(result),
  }
}
