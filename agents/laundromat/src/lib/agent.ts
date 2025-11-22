import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { handler } from "./laundromat";
import { LaunderStrategy, LAUNDROMATS } from "./constants";

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

const _price = (strategy: LaunderStrategy) => {
  return (LAUNDROMATS[strategy].amount / 1000000).toFixed(6);
};

addEntrypoint({
  key: LAUNDROMATS[LaunderStrategy.Low].endpoint,
  description: LAUNDROMATS[LaunderStrategy.Low].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.Low),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.Low, ctx);
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
  key: LAUNDROMATS[LaunderStrategy.High].endpoint,
  description: LAUNDROMATS[LaunderStrategy.High].description,
  input: z.object({
    name: z.string().min(1, "The Syndicate name."),
    account: z.string().min(1, "Target account address."),
  }),
  price: _price(LaunderStrategy.High),
  handler: async (ctx: any) => {
    return await handler(LaunderStrategy.High, ctx);
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