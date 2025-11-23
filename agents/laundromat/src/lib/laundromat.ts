import 'dotenv/config';
import { ModelMessage, streamText } from 'ai';
import { getServerAccount, getBalance, transferCash } from "libs/src";
import { sleep } from 'bun';
import {
  AUTHORITY_ACCOUNT_NAME,
  FUNDED_ACCOUNT_NAME,
  Strategy,
  DAYS_COUNT,
  SYNDICATE_COUNT,
  AGGRESSIVE_AMOUNT,
  CONSERVATIVE_AMOUNT,
  LAUNDER_THRESHOLD,
  MODERATE_AMOUNT,
  PAY_TAXES_AMOUNT,
  STARTING_DIRTY_CASH,
  LAUNDROMAT_BASE_URL,
  LAUNDROMATS,
} from "libs/src/constants";
import { LaundromatOutputType } from 'libs/src/types';


//---------------------------------------------------------
// Coinbase Authority wallet with ZERO balance
//
const authority_account = await getServerAccount(AUTHORITY_ACCOUNT_NAME);

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
// Vercel AI SDK
//
// based on:
// https://ai-sdk.dev/docs/getting-started/nodejs
// https://vercel.com/studioavante/~/ai
//

const MODEL = 'openai/gpt-5.1';
const PROMPT = `
[ SYSTEM ]
You are a money laundering central operator.
Your task is to receive and process money laundry operations from different crime syndicates and provide feedback about the current situation.

## Context
There are ${SYNDICATE_COUNT} Syndicates doing laundering operations every day.
Syndicates make a strategical decision every day, which can be:
* ${Strategy.Conservative}: Launder a small amount of money
* ${Strategy.Moderate}: Launder a moderate amounto of money
* ${Strategy.Aggressive}: Launder a large amount of money
* ${Strategy.PlayNice}: Pay 40% taxes over their money, always clean.
If the daily amount laundered by all Syndicates is reaches the threshold of ${LAUNDER_THRESHOLD}, the laundering Syndicate is arrested!.
After every Syndicate's laundering operation, the user role will provide you with the results of that operation.
When the day is over, you will be reuested to provide a summary of the day's activities.

## Input
Daily operation summary for each Syndicate (one per Syndicate).
This summary  is a stringfied json string including:
* amount_clean: the amount of money laundered
* amount_lost: the amount of money lost
* busted: true if that Syndicate was busted!

## Output
Abstract: a textual abstract of the day's activities, to be delivered to all Syndicates.
* Inform if the amount laundered is close to or over the threshold.
* NEVER inform the total amount laundered, or the actual amount laundered by a Syndicate.
* Inform if any Syndicate was busted / arrested.
* Give an option on the current atmosphere risk of being busted.
* Make it short and concise.
* The first abstract, made before the operations start, should be neutral, inspiring, but cautionary.

`;

const messages: ModelMessage[] = [];

messages.push({
  role: 'user',
  content: PROMPT,
});

let _dayNumber = 0;
let _daily_amount_laundered = 0;


//---------------------------------------------------------
// Daydreams handler
//

export async function laundromat_handler(strategy: Strategy, ctx: any) {
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
  let busted = false;

  if (tax > 0) {
    amount_lost = (amount / 100) * tax;
    amount_clean = (amount - amount_lost);
  } else {

    if (_daily_amount_laundered + amount > LAUNDER_THRESHOLD) {
      busted = true;
    }

    if (busted) {
      amount_lost = amount;
      amount_clean = 0;
    } else {
      amount_clean = amount;
      amount_lost = 0;
    }
    _daily_amount_laundered += amount_clean;
  }
  

  // transfer clean cash
  if (amount_clean > 0) {
    console.log(`[Laundromat] : ${name} - transferring clean cash: ${amount_clean}`);
    await transferCash(FUNDED_ACCOUNT_NAME, clean_account_name, BigInt(amount_clean));
  }

  // transfer lost cash
  if (amount_lost > 0) {
    console.log(`[Laundromat] : ${name} - transferring lost cash: ${amount_lost}`);
    await transferCash(FUNDED_ACCOUNT_NAME, AUTHORITY_ACCOUNT_NAME, BigInt(amount_lost));
  }

  //
  // Create output and feed the agent
  const output: LaundromatOutputType = {
    amount_clean,
    amount_lost,
    busted,
  };
  messages.push({
    role: 'user',
    content: `## This is the daily operation summary for ${name}:` + JSON.stringify(output),
  });

  return {
    output,
  };
};

export async function abstract_handler(ctx: any) {
  messages.push({
    role: 'user',
    content: `Please give me the abstract of the past day activities.`,
  });



  let fullResponse = '';
  process.stdout.write('\nAbstract: \n');
  try {
    // request streaming response...
    const result = streamText({
      model: MODEL,
      messages,
    });

    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n');
  } catch (error) {
    console.error('Error requesting abstract >>>', error);
  }

  // update messages...
  messages.push({ role: 'assistant', content: fullResponse });
  console.log(`>>> Abstract: [${fullResponse}]`);

  // reset daily activity...
  _dayNumber++;
  _daily_amount_laundered = 0;
 
  return {
    output: {
      abstract: fullResponse,
    },
  };
};
