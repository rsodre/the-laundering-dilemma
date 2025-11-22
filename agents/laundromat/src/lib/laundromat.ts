import 'dotenv/config';
import { LAUNDROMATS, Strategy } from "libs/src/constants";

export async function handler(strategy: Strategy, ctx: any) {
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
