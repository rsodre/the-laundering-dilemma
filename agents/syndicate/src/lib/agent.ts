import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { Strategy } from "libs/src/constants";
import { launder_handler, profile_handler } from "./syndicate";


//---------------------------------------------------------
// Daydreams agent setup
//
const appOptions = {
  payments: {
    facilitatorUrl: process.env.PAYMENTS_FACILITATOR_URL as `${string}://${string}`,
    network: process.env.PAYMENTS_NETWORK as any,
    payTo: '0x0', // this endpoint has no receivable wallet
  },
};
const { app, runtime, addEntrypoint } = createAgentApp(
  {
    name: 'syndicate-agent', //process.env.AGENT_NAME as string,
    description: 'Syndicate agent', //process.env.AGENT_DESCRIPTION as string,
    version: process.env.AGENT_VERSION as string,
  },
  typeof appOptions !== 'undefined' ? appOptions : {}
);

//
// Daydreams endpoints
//
addEntrypoint({
  key: "profile",
  description: "Get this Syndicate profile information",
  input: z.object({}),
  output: z.object({
    boss_name: z.string().describe(`Boss name`),
    syndicate_name: z.string().describe(`Syndicate name`),
    dirty_wallet_name: z.string().describe(`Dirty wallet name`),
    clean_wallet_name: z.string().describe(`Clean wallet name`),
    dirty_wallet_address: z.string().describe(`Dirty wallet address`),
    clean_wallet_address: z.string().describe(`Clean wallet address`),
    busted: z.boolean().describe(`Busted flag`),
  }),
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await profile_handler(ctx);
  },
});

addEntrypoint({
  key: "launder",
  description: "Called when it's time to launder some cash",
  input: z.object({
    abstract: z.string().min(1, "Past day activities abstract."),
  }),
  output: z.object({
    strategy: z.enum([Strategy.Conservative, Strategy.Moderate, Strategy.Aggressive, Strategy.PlayNice]).describe(`Laundering strategy`),
    amount_clean: z.number().describe(`Laundered amount`),
    amount_lost: z.number().describe(`Taxed/Lost amount`),
    busted: z.boolean().describe(`Busted flag`),
    success: z.boolean().describe(`Success flag`),
  }),
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await launder_handler(ctx);
  },
});

export { app };
