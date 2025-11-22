import 'dotenv/config';
import { AUTHORITY_ACCOUNT_NAME, FUNDED_ACCOUNT_NAME, LAUNDROMATS, Strategy } from "libs/src/constants";
import { createAccount, getBalance, transferCash } from "libs/src/cdp";
import { sleep } from 'bun';


//---------------------------------------------------------
// Coinbase Authority wallet with ZERO balance
//
const authority_account = await createAccount(AUTHORITY_ACCOUNT_NAME);

//
// fund wallet
const balance = await getBalance(authority_account.address);
console.log(`[${AUTHORITY_ACCOUNT_NAME}] balance:`, balance.formatted_cash);
if (balance.balance > 0n) {
  console.log(`[${AUTHORITY_ACCOUNT_NAME}] emptying wallet...`);
  await transferCash(AUTHORITY_ACCOUNT_NAME, FUNDED_ACCOUNT_NAME, balance.balance);
  console.log(`[${AUTHORITY_ACCOUNT_NAME}] waiting for confirmation...`);
  await sleep(5000);
  const balance_after = await getBalance(authority_account.address);
  console.log(`[${AUTHORITY_ACCOUNT_NAME}] balance:`, balance_after.formatted_cash);
}



//---------------------------------------------------------
// Daydreams handler
//

export async function handler(strategy: Strategy, ctx: any) {
  const name = String(ctx.input?.name ?? '').trim();
  const clean_account_name = String(ctx.input?.clean_account_name ?? '').trim();
  console.log(`[Laundromat:${strategy}] : ${name}`);

  // this endpoint data...
  const Laundromat = LAUNDROMATS[strategy];
  const amount = Laundromat.amount;
  const tax = Laundromat.tax;

  // get busted status
  let amount_lost = 0;
  let amount_clean = 0;
  let busted = true;

  if (tax > 0) {
    amount_lost = (amount / 100) * tax;
    amount_clean = (amount - amount_lost);
  } else {

    //
    // TODO: Get busted flag...
    //

    if (busted) {
      amount_lost = amount;
      amount_clean = 0;
    } else {
      amount_clean = amount;
      amount_lost = 0;
    }
  }

  // transfer clean cash
  if (amount_clean > 0) {
    transferCash(FUNDED_ACCOUNT_NAME, clean_account_name, BigInt(amount_clean));
  }

  // transfer lost cash
  if (amount_lost > 0) {
    transferCash(FUNDED_ACCOUNT_NAME, AUTHORITY_ACCOUNT_NAME, BigInt(amount_lost));
  }

  return {
    output: {
      amount_clean,
      amount_lost,
      busted,
    },
  };
};
