import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { handler } from "./syndicate";


//---------------------------------------------------------
// Daydreams agent setup
//
const appOptions = {
  payments: {
    facilitatorUrl: process.env.PAYMENTS_FACILITATOR_URL as `${string}://${string}`,
    payTo: '0x0', // this endpoint has no receivable wallet
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

//
// Daydreams endpoints
//
addEntrypoint({
  key: "launder",
  description: "Launder some cash",
  input: z.object({
    abstract: z.string().min(1, "Past day news abstract."),
  }),
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await handler(ctx);
  },
});

export { app };
