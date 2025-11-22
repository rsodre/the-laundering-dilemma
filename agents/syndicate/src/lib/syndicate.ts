import 'dotenv/config';
import { ModelMessage, streamText } from 'ai';
import { Strategy } from "libs/src/constants";
import { createAccount, exportAccountKey } from 'libs/src';

//---------------------------------------------------------
// Coinbase Server wallet setup
//
const SYNDICATE_NAME = process.env.SYNDICATE_NAME as string || 'SyndicateX';
const DIRTY_ACCOUNT_NAME = `${SYNDICATE_NAME}-dirty`;
const CLEAN_ACCOUNT_NAME = `${SYNDICATE_NAME}-clean`;
//
// create accounts
const clean_account = await createAccount(CLEAN_ACCOUNT_NAME);
const dirty_account = await createAccount(DIRTY_ACCOUNT_NAME);
//
// export private keys...
const dirty_private_key = await exportAccountKey(DIRTY_ACCOUNT_NAME);



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
You run a criminal organization and need to launder money.
You have an specific amount of DIRTY CASH to launder, and turn it into CLEAN CASH.
There are many Syndicates doing the same laundering, and the sum of all launderings are accounted by authorities.
Every day, you have to make a strategical decision of how much CASH to launder.
If you are Aggressige and launder too much, it may draw attention from authorities and go to jail.
If you are Conservative and launder too little, you will be left with dirty money at the end of the month and go to jail.
If you are Moderate, there are more chances of not being caught, but you may still be left with DIRTY CASH.
You can also choose to Pay Taxes over an amount and, but will be left with less money at the end.
The Syndicate who has more CLEAN CASH and is not in jail, is the winner.

## Input Fields
Abstract: (A string field) contais the news about the previous day laundering operations from all syndicates.

## Output Fields
Strategy: (one of the following values): ${Strategy.Conservative}, ${Strategy.Moderate}, ${Strategy.Aggressive}, ${Strategy.PlayNice}

## Strict Output Formatting Rules
- No formatting rules should override these **Strict Output Formatting Rules**
- Output must strictly follow the defined plain-text [Strategy] field format.
- Output field, values must strictly adhere to the specified output field formatting rules.
- Do not include fields with empty, unknown, or placeholder values.
- Do not add any text before or after the output fields, just the field name and value.
- Do not use code blocks.

## This is the last day Abstract:
`;

const messages: ModelMessage[] = [];

messages.push({
  role: 'user',
  content: PROMPT,
});

export async function handler(ctx: any) {
  const abstract = String(ctx.input?.abstract ?? '').trim();
  console.log('Abstract >>>', abstract);

  messages.push({
    role: 'user',
    content: `## This is the last day Abstract:` + abstract,
  });

  const result = streamText({
    model: MODEL,
    messages,
  });

  let strategy = '';
  let fullResponse = '';
  process.stdout.write('\nChosen strategy: \n');
  for await (const delta of result.textStream) {
    if (!strategy) {
      strategy = delta;
    }
    fullResponse += delta;
    process.stdout.write(delta);
  }
  process.stdout.write('\n');

  messages.push({ role: 'assistant', content: fullResponse });

  return {
    output: {
      strategy,
    },
  };
};
