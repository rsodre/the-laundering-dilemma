import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { handler } from "./laundromat";
import { LaunderStrategy, LAUNDROMATS } from "libs/src";



//---------------------------------------------------------
// Daydreams agent setup
//
const appOptions = {
  payments: {
    facilitatorUrl: process.env.PAYMENTS_FACILITATOR_URL as `${string}://${string}`,
    payTo: process.env.PAYMENTS_RECEIVABLE_ADDRESS as `0x${string}`,
    network: process.env.PAYMENTS_NETWORK as any,
  },
};

const { app, runtime, addEntrypoint } = createAgentApp(
  {
    name: process.env.AGENT_NAME as string,
    version: process.env.AGENT_VERSION as string,
    description: process.env.AGENT_DESCRIPTION as string,
  },
  typeof appOptions !== 'undefined' ? appOptions : {}
);


//---------------------------------------------------------
// Daydreams endpoints
//

const _price = (strategy: LaunderStrategy) => (LAUNDROMATS[strategy].amount / 1000000).toFixed(6);

addEntrypoint({
  key: LAUNDROMATS[LaunderStrategy.Conservative].endpoint,
  description: LAUNDROMATS[LaunderStrategy.Conservative].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.Conservative),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.Conservative, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[LaunderStrategy.Moderate].endpoint,
  description: LAUNDROMATS[LaunderStrategy.Moderate].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.Moderate),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.Moderate, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[LaunderStrategy.Aggressive].endpoint,
  description: LAUNDROMATS[LaunderStrategy.Aggressive].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.Aggressive),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.Aggressive, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[LaunderStrategy.PayTaxes].endpoint,
  description: LAUNDROMATS[LaunderStrategy.PayTaxes].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.PayTaxes),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.PayTaxes, ctx);
  },
});

export { app };