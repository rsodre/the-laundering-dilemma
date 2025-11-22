import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { handler } from "./syndicate";
import { Strategy } from "libs/src/constants";


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
// addEntrypoint({
//   key: "profile",
//   description: "Get this Syndicate profile information",
//   input: z.object({}),
//   handler: async (ctx: any) => {
//     // console.log('Context >>>', ctx);
//     return await handler(ctx);
//   },
// });

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
    success: z.boolean().describe(`Success flag`),
  }),
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await handler(ctx);
  },
});

export { app };
