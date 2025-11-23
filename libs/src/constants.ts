
//---------------------------------------------------------
// Laundering market conditions
//

export const DAYS_COUNT = 3;
export const SYNDICATE_COUNT = 5;
export const STARTING_DIRTY_CASH = 100_000;
export const LAUNDER_THRESHOLD = 45_000;
export const LAUNDROMAT_BASE_URL = 'http://localhost:3000';
export const FUNDED_ACCOUNT_NAME = "FundedAccount";
export const AUTHORITY_ACCOUNT_NAME = "AuthorityAccount";

// laundering amounts
export const CONSERVATIVE_AMOUNT = 5_000;
export const MODERATE_AMOUNT = 10_000;
export const AGGRESSIVE_AMOUNT = 25_000;
export const PAY_TAXES_AMOUNT = 20_000;



//---------------------------------------------------------
// Strategies
//

export enum Strategy {
  Conservative = 'conservative',
  Moderate = 'moderate',
  Aggressive = 'aggressive',
  PlayNice = 'play_nice',
}

export type LaundromatType = {
  endpoint: string;
  description: string;
  amount: number;       // Base units (1/1_000_000 USDC)
  tax: number;          // Percentage (0-100)
};

export const LAUNDROMATS: Record<Strategy, LaundromatType> = {
  [Strategy.Conservative]: {
    endpoint: 'launder_conservative',
    description: 'Launder with low risk ($10,000)',
    amount: CONSERVATIVE_AMOUNT,
    tax: 0,
  },
  [Strategy.Moderate]: {
    endpoint: 'launder_moderate',
    description: 'Launder with moderate risk ($50,000)',
    amount: MODERATE_AMOUNT,
    tax: 0,
  },
  [Strategy.Aggressive]: {
    endpoint: 'launder_aggressive',
    description: 'Launder with high risk ($100,000)',
    amount: AGGRESSIVE_AMOUNT,
    tax: 0,
  },
  [Strategy.PlayNice]: {
    endpoint: 'pay_taxes',
    description: 'Pay 40% taxes over $100,000, no laundering required.',
    amount: PAY_TAXES_AMOUNT,
    tax: 40,
  },
};
