import 'dotenv/config';
import { LaunderStrategy, LAUNDROMATS } from 'libs/src';

export async function handler(strategy: LaunderStrategy, ctx: any) {
  const name = String(ctx.input?.name ?? '').trim();
  const account = String(ctx.input?.account ?? '').trim();
  console.log(`[Laundromat:${strategy}] : ${name}`);

  const Laundromat = LAUNDROMATS[strategy];
  const amount = Laundromat.amount;
  const tax = Laundromat.tax;

  const amount_laundered = (amount - ((amount / 100) * tax));

  return {
    output: {
      amount_laundered,
    },
  };
};
