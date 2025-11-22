import { z } from "zod";
import { createAgentApp } from "@lucid-agents/hono";
import { launder_handler, profile_handler } from "./syndicate";
import {
  laundromat_input_schema,
  syndicate_launder_input_schema,
  syndicate_launder_output_schema,
  syndicate_profile_output_schema,
} from "libs/src/types";


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


//---------------------------------------------------------
// Daydreams endpoints
//

//
// syndicate profile
//
addEntrypoint({
  key: "profile",
  description: "Get this Syndicate profile information",
  input: z.object({}),
  output: syndicate_profile_output_schema,
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await profile_handler(ctx);
  },
});


//
// syndicate launder
// make a decicion and launder some CASH
//
addEntrypoint({
  key: "launder",
  description: "Called when it's time to launder some cash",
  input: syndicate_launder_input_schema,
  output: syndicate_launder_output_schema,
  handler: async (ctx: any) => {
    // console.log('Context >>>', ctx);
    return await launder_handler(ctx);
  },
});

export { app };
