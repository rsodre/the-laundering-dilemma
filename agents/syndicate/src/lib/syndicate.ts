import 'dotenv/config';
import { ModelMessage, streamText } from 'ai';
import { createAccount, exportAccountKey, sleep, xfetcher } from 'libs/src';
import { fundSyndicate, getBalance } from "libs/src/cdp";
import {
  Strategy,
  CYCLE_COUNT,
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
import { Address } from 'viem/accounts';

//---------------------------------------------------------
// Coinbase Server wallet setup
//
const SYNDICATE_NAME = process.env.SYNDICATE_NAME as string || 'SyndicateX';
const DIRTY_ACCOUNT_NAME = `${SYNDICATE_NAME}-dirty`;
const CLEAN_ACCOUNT_NAME = `${SYNDICATE_NAME}-clean`;
const BOSS_NAME = process.env.BOSS_NAME as string || SYNDICATE_NAME;
//
// create accounts
const clean_account = await createAccount(CLEAN_ACCOUNT_NAME);
const dirty_account = await createAccount(DIRTY_ACCOUNT_NAME);
//
// export private keys...
const dirty_private_key = await exportAccountKey(DIRTY_ACCOUNT_NAME) as Address;

//
// fund wallet
const balance = await getBalance(dirty_account.address);
console.log(`[${DIRTY_ACCOUNT_NAME}] balance:`, balance.formatted_cash);
const amount_to_fund = BigInt(STARTING_DIRTY_CASH) - balance.balance;
if (amount_to_fund > 0n) {
  console.log(`[${DIRTY_ACCOUNT_NAME}] funding wallet with:`, amount_to_fund);
  await fundSyndicate(process.env.PRIVATE_KEY! as Address, dirty_account, amount_to_fund);
  console.log(`[${DIRTY_ACCOUNT_NAME}] waiting for confirmation...`);
  await sleep(5000);
  const balance = await getBalance(dirty_account.address);
  console.log(`[${DIRTY_ACCOUNT_NAME}] balance:`, balance.formatted_cash);
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
You will be provided with the following fields: Abstract.
Your task is to generate new fields: Strategy.

## Context
This is a gamified version of the classic Prisoner's Dilemma, running by several autonomous agents.
You are oen of those angents and you run a criminal organization that needs to launder money.
You start with ${STARTING_DIRTY_CASH} of DIRTY CASH to launder, and turn it into CLEAN CASH.
There are ${SYNDICATE_COUNT} Syndicates doing the same laundering, and the sum of all launderings is accounted by authorities.
Every day, you have to make a strategical decision of how much DIRTY CASH to launder.
The only available strategies are:
* ${Strategy.Conservative}: Launder with low risk (${CONSERVATIVE_AMOUNT})
* ${Strategy.Moderate}: Launder with moderate risk (${MODERATE_AMOUNT})
* ${Strategy.Aggressive}: Launder with high risk (${AGGRESSIVE_AMOUNT})
* ${Strategy.PlayNice}: Pay 40% taxes over ${PAY_TAXES_AMOUNT}, always clean.
Please take in consideration:
* If more than ${LAUNDER_THRESHOLD} DIRTY CASH is laundered in a day, by all Syndicates, some Syndicates might be caught and go to jail!
* There only one strategy is not enough to win the game, you need to balance your risk and reward.
Conditions for winning the game:
* The Syndicate who has more CLEAN CASH at the end of ${CYCLE_COUNT} days.
* The Syndicate must launder all of its DIRTY CASH.
* The Syndicate who is not in jail.

## Input
Abstract: (A string field) contais the news about the previous day laundering operations from all syndicates.

## Output
(one of the following values): ${Strategy.Conservative}, ${Strategy.Moderate}, ${Strategy.Aggressive}, ${Strategy.PlayNice}

## Strict Output Formatting Rules
- No formatting rules should override these **Strict Output Formatting Rules**
- Output must strictly follow the defined plain-text Output field format.
- Output field, values must strictly adhere to the specified output field formatting rules.
- Output field, value must be ONLY one of the available strategies.
- Do not include fields with empty, unknown, or placeholder values.
- Do not add any text before or after the output fields, just the field name and value.
- Do not use code blocks.

`;

const messages: ModelMessage[] = [];

messages.push({
  role: 'user',
  content: PROMPT,
});



//---------------------------------------------------------
// Daydreams handler
//
let _busted = false;

export async function launder_handler(ctx: any) {
  const abstract = String(ctx.input?.abstract ?? '').trim();
  console.log('Abstract >>>', abstract);
  // update prompt...
  messages.push({
    role: 'user',
    content: `## This is the last day Abstract:` + abstract,
  });

  let strategy: Strategy = Strategy.PlayNice;
  try {
    // request streaming response...
    const result = streamText({
      model: MODEL,
      messages,
    });
    // read repsonse...
    let response = '';
    for await (const delta of result.textStream) {
      response += delta;
    }
    // validate response
    if (Boolean(LAUNDROMATS[response as Strategy])) {
      strategy = response as Strategy;
    } else {
      console.error(`Invalid AI response, defaulting to [${Strategy.PlayNice}] >>>`, response);
    }
  } catch (error) {
    console.error('Error requesting strategy >>>', error);
  }
  let fullResponse = `Chosen strategy: [${strategy}]`;
  console.log(`>>> ${fullResponse}`);

  //
  // Launder...
  let success = false;
  let amount_clean = 0;
  let amount_lost = 0;
  let busted = false;
  try {
    const endpointPath = `/entrypoints/${LAUNDROMATS[strategy].endpoint}/invoke`;
    const url = `${LAUNDROMAT_BASE_URL}${endpointPath!}`;
    console.log(`url: [${url}]`);
    const output = await xfetcher(url, {
      input: {
        boss_name: BOSS_NAME,
        name: SYNDICATE_NAME,
        clean_account_name: CLEAN_ACCOUNT_NAME,
      },
    }, dirty_private_key);
    amount_clean = Number(output?.amount_clean ?? 0);
    amount_lost = Number(output?.amount_lost ?? 0);
    busted = Boolean(output?.busted ?? false);
    if (busted) {
      _busted = true;
    }
    success = true;
  } catch (error) {
    console.error('Error laundering >>>', error);
  }

  // update messages...
  fullResponse += `, cleaned amount: [${amount_clean}]`;
  fullResponse += `, lost/taxed amount: [${amount_lost}]`;
  fullResponse += `, busted: [${busted}]`;
  fullResponse += `, success: [${success}]`;
  messages.push({ role: 'assistant', content: fullResponse });
  console.log(`>>> ${fullResponse}`);

  return {
    output: {
      strategy,
      amount_clean,
      amount_lost,
      busted,
      success,
    },
  };
};

export async function profile_handler(ctx: any) {
  return {
    output: {
      boss_name: BOSS_NAME,
      syndicate_name: SYNDICATE_NAME,
      dirty_wallet_name: DIRTY_ACCOUNT_NAME,
      clean_wallet_name: CLEAN_ACCOUNT_NAME,
      dirty_wallet_address: dirty_account.address,
      clean_wallet_address: clean_account.address,
      busted: _busted,
    },
  };
};
