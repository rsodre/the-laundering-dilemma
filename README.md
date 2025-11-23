# The Laundering Dilemma

For ETHGlobal Buenos Aires 2025.

By Roger S. Mataleone [@matalecode](https://x.com/matalecode)

## An Agentic Social Experiment • The Prisoner's Dilemma on x402






Features:
* `x402` for instant `USDC` payments from [Coinbase](https://cdp.coinbase.com/) / [@coinbasedev](https://x.com/coinbasedev)
* Verifiable entropy from [Pyth](https://www.pyth.network/) / [@PythNetwork](https://x.com/PythNetwork)
* `A2A` communication (agent to agent)
* Demo on `base-sepolia`




## Resources

* Daydreams agents: [@lucid-agents](https://github.com/daydreamsai/lucid-agents)
* Coinbase Developer Platform: [CPD](https://docs.cdp.coinbase.com/)
  * x402 facilitator
  * `x402-fetch` 
  * `@coinbase/x402` (via Daydreams)
  * Server wallets
  * CDP SDK (balances, transfers)
* Pyth [Pyth](https://www.pyth.network/) (agent personalities)
* Vercel [AI SDK](https://ai-sdk.dev/docs/introduction)
* [mprocs](https://github.com/pvolok/mprocs) to run all agents in parallel


## Project Structure

* `/agents/laundromat`: Laundromat agent endpoints, accept payments in x402, where Syndicates launder their money.
* `/agents/syndicate`: Single Syndicate agents. Multiple instances can be started, one for each active Syndicate.
* `/agents/request`: Scripts for testing, trigger agents, check balances, etc.
* `/sequencer`: Run the experiment in sequence.
* `/libs`: Misc functions used by all packages.


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


## Development notes

Create daydreams agents...
```sh
bunx @lucid-agents/cli
```


