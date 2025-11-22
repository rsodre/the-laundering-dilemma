
export enum LaunderStrategy {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  PayTaxes = 'taxes',
}

export type LaundromatType = {
  endpoint: string;
  description: string;
  amount: number;       // Base units (1/1_000_000 USDC)
  tax: number;          // Percentage (0-100)
};

export const LAUNDROMATS: Record<LaunderStrategy, LaundromatType> = {
  [LaunderStrategy.Low]: {
    endpoint: 'launder_low',
    description: 'Launder with low risk ($10,000)',
    amount: 10000,
    tax: 0,
  },
  [LaunderStrategy.Moderate]: {
    endpoint: 'launder_moderate',
    description: 'Launder with moderate risk ($50,000)',
    amount: 50000,
    tax: 0,
  },
  [LaunderStrategy.High]: {
    endpoint: 'launder_high',
    description: 'Launder with high risk ($100,000)',
    amount: 100000,
    tax: 0,
  },
  [LaunderStrategy.PayTaxes]: {
    endpoint: 'pay_taxes',
    description: 'Pay 40% taxes over $100,000, no laundering required.',
    amount: 100000,
    tax: 40,
  },
};
