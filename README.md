# The Laundering Dilemma

For ETHGlobal Buenos Aires 2025.

By Roger S. Mataleone [@matalecode](https://x.com/matalecode)


## An Agentic Social Experiment • The Prisoner's Dilemma on x402

In the classic Prisoner's Dilemma social experiment, two criminals must learn to cooperate to get the best outcome for their sentences. If both stay quiet, they both get a light sentence; if both snitch, they get the maximum sentence!

Let's reimagine this experiment, but using AI agents and x402 as a way of (cough) laundering money. Five criminal Syndicates have $100.000 to launder in one week, choosing four different strategies: conservative, moderate, aggressive or just play nice and pay those damn taxes.

But if they push too hard... the authorities will notice and seize their stash!


## Doing the Dirty Business

The experiment contains two types of agents:

* One Laundromat agent: the shadowy figure in charge of the dirty laundry, powered by an AI model that keeps track of current activities and gives a summary of activities by the end of each day. 

* Five Syndicate agents: each with the same amount of Dirty money to launder. Every day, they choose one strategy to launder some cash, and hope they are in sync with other Syndicates. If they launder too much above the market threshold... busted! The surviving agents with more clean money by the end of the week are the winners.

When a Syndicate calls a Laundromat x402 endpoint using their Dirty wallet, that dough can be cleaned and transferred to their Clean wallet, or seized by the Authority. It's all or nothing!

A Sequencer script keeps calling Syndicates randomly when it's their time to launder, and writes an acivity log for the client.

All agents are x402-enabled, created using Daydreams and Coinbase CDP.
All wallets and EVM interactions are made using the CDP SDK.
AI agents created using Vercel AI SDK.


## Resources

* Daydreams agents: [@lucid-agents](https://github.com/daydreamsai/lucid-agents)
  * `x402` enabled endpoints with instant `USDC` payments
  * `A2A` (agent to agent) transactions
* Coinbase Developer Platform: [CPD](https://docs.cdp.coinbase.com/) | [@coinbasedev](https://x.com/coinbasedev)
  * x402 facilitator
  * `x402-fetch`
  * `@coinbase/x402` (via Daydreams)
  * Server wallets
  * CDP SDK (balances, transfers)
* Pyth [Pyth](https://www.pyth.network/) (agent personalities)
* Vercel [AI SDK](https://ai-sdk.dev/docs/introduction)
* [mprocs](https://github.com/pvolok/mprocs) to run all agents in parallel
* React + Shadcn + Tailwind client, 100% vibe coded in Cursor.


## Project Structure

* `/agents/laundromat`: Laundromat agent endpoints, accept payments in x402, where Syndicates launder their money.
* `/agents/syndicate`: Single Syndicate agents. Multiple instances can be started, one for each active Syndicate.
* `/agents/request`: Scripts for testing, trigger agents, check balances, etc.
* `/sequencer`: Run the experiment in sequence.
* `/libs`: Misc functions used by all packages.
* `/client`: Displays the experiment in real time.


## Environment setup

* `/agents/laundromat/.env`:
```sh
# x402 setup
PAYMENTS_FACILITATOR_URL=https://x402.org/facilitator
PAYMENTS_NETWORK=base-sepolia
PAYMENTS_RECEIVABLE_ADDRESS=<...>
# Coinbase CDP setup
CDP_API_KEY_ID=<...>
CDP_API_KEY_SECRET=<...>
CDP_WALLET_SECRET=<...>
# Vercel AI SDK
AI_GATEWAY_API_KEY=<...>
```

* `/agents/syndicate/.env`:
```sh
# syndicate name, linked to Server Wallet
SYNDICATE_NAME=Syndicate1
BOSS_NAME=Dirty Tony
# x402 setup
PAYMENTS_FACILITATOR_URL=https://x402.org/facilitator
PAYMENTS_NETWORK=base-sepolia
# Coinbase CDP setup
CDP_API_KEY_ID=<...>
CDP_API_KEY_SECRET=<...>
CDP_WALLET_SECRET=<...>
# Vercel AI SDK
AI_GATEWAY_API_KEY=<...>
```

* `/agents/request/.env` | `/sequencer/.env`:
```sh
# funded wallet for x402 test payments
PRIVATE_KEY=<...>
# Coinbase CDP setup
CDP_API_KEY_ID=<...>
CDP_API_KEY_SECRET=<...>
CDP_WALLET_SECRET=<...>
```


## Start the experiment

I used `mprocs` to run all agents at the same time...

```sh
$ cd ./
$ bun run experiment
```


## Testing agents

Terminal 1: Start **Laundromat** agent at [http://localhost:3000/](http://localhost:3000/)
```sh
$ cd agents/laundromat
$ bun run dev
```

Terminal 2: Start **Syndicate** agent at [http://localhost:3100/](http://localhost:3100/)
```sh
$ cd agents/syndicate
$ bun run dev
```

Terminal 3: Trigger **Syndicate** laundering...
```sh
$ cd agents/request
$ bun run launder
```

Checking balances...
```sh
$ cd agents/request
$ bun run balances
```


## Development notes

Create daydreams agents...
```sh
bunx @lucid-agents/cli
```


