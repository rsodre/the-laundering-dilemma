# the-laundering-dilemma

For ETHGlobal Buenos Aires 2025.

By Roger Mataleone [@matalecode](https://x.com/matalecode)

## The Laundering Dilemma


Based on The Prisoner's Dilemma



## Resources

* Daydreams: [@lucid-agents](https://github.com/daydreamsai/lucid-agents)
* Coinbase Developer Platform: [CPD](https://docs.cdp.coinbase.com/)
  * x402 facilitator
  * Server wallets
  * CDP SDK (balances, transfers)
* Pyth entropy
* Vercel [AI SDK](https://ai-sdk.dev/docs/introduction)


## Project Structure

* `/agents/laundromat`: Laundromat agent endpoints, accept payments in x402, where Syndicates launder their money.
* `/agents/syndicate`: Single Syndicate agents. Multiple instances can be started, one for each active Syndicate.
* `/agents/request`: Scripts for testing, create requests for agents, check balances, etc.
* `/libs`: Misc functions used by all packages.


## Environment setup

* `/agents/laundromat/.env`:
```
PAYMENTS_FACILITATOR_URL=https://x402.org/facilitator
PAYMENTS_NETWORK=base-sepolia
PAYMENTS_RECEIVABLE_ADDRESS=<...>
PRIVATE_KEY=<...>
AI_GATEWAY_API_KEY=<...>
```

* `/agents/syndicate/.env`:
```
PAYMENTS_FACILITATOR_URL=https://x402.org/facilitator
PAYMENTS_NETWORK=base-sepolia
PAYMENTS_RECEIVABLE_ADDRESS=<...>
PRIVATE_KEY=<...>
AI_GATEWAY_API_KEY=<...>
```

* `/agents/request/.env`:
```
PRIVATE_KEY=<payer_private_key>
```

## Development notes

Create daydreams agents...
```
bunx @lucid-agents/cli
```


