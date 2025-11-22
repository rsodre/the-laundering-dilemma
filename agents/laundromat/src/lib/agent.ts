import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { handler } from "./laundromat";
import { LAUNDROMATS, Strategy } from "libs/src/constants";
import { laundromat_input_schema, laundromat_output_schema } from "libs/src/types";



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
    name: 'laundromat-agent', //process.env.AGENT_NAME as string,
    description: 'Laundromat agent', //process.env.AGENT_DESCRIPTION as string,
    version: process.env.AGENT_VERSION as string,
  },
  typeof appOptions !== 'undefined' ? appOptions : {}
);


//---------------------------------------------------------
// Daydreams endpoints
//

const _price = (strategy: Strategy) => (LAUNDROMATS[strategy].amount / 1000000).toFixed(6);

addEntrypoint({
  key: LAUNDROMATS[Strategy.Conservative].endpoint,
  description: LAUNDROMATS[Strategy.Conservative].description,
  input: laundromat_input_schema,
  output: laundromat_output_schema,
  price: _price(Strategy.Conservative),
  handler: async (ctx: any) => {
    return await handler(Strategy.Conservative, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[Strategy.Moderate].endpoint,
  description: LAUNDROMATS[Strategy.Moderate].description,
  input: laundromat_input_schema,
  output: laundromat_output_schema,
  price: _price(Strategy.Moderate),
  handler: async (ctx: any) => {
    return await handler(Strategy.Moderate, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[Strategy.Aggressive].endpoint,
  description: LAUNDROMATS[Strategy.Aggressive].description,
  input: laundromat_input_schema,
  output: laundromat_output_schema,
  price: _price(Strategy.Aggressive),
  handler: async (ctx: any) => {
    return await handler(Strategy.Aggressive, ctx);
  },
});

addEntrypoint({
  key: LAUNDROMATS[Strategy.PlayNice].endpoint,
  description: LAUNDROMATS[Strategy.PlayNice].description,
  input: laundromat_input_schema,
  output: laundromat_output_schema,
  price: _price(Strategy.PlayNice),
  handler: async (ctx: any) => {
    return await handler(Strategy.PlayNice, ctx);
  },
});

export { app };