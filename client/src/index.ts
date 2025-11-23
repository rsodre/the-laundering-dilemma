import { serve } from "bun";
import { config } from "dotenv";
import index from "./index.html";

// Load environment variables from parent directory (where .env files are typically located)
// Try loading from parent directory first, then current directory
config({ path: "../.env" });
config({ path: ".env" });

const server = serve({
  routes: {
    // Proxy health checks to agents (syndicates and laundromat)
    "/api/health/:port": async (req) => {
      const port = req.params.port;
      try {
        const response = await fetch(`http://localhost:${port}/health`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        });
        
        if (!response.ok) {
          return Response.json({ ok: false, error: `HTTP ${response.status}` }, { status: response.status });
        }
        
        const data = await response.json();
        return Response.json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
          },
        });
      } catch (error) {
        return Response.json({ ok: false, error: String(error) }, { status: 503 });
      }
    },

    // Proxy laundromat entrypoints
    "/api/laundromat/entrypoints/:endpoint/invoke": async (req) => {
      const endpoint = req.params.endpoint;
      try {
        const body = await req.json();
        const response = await fetch(`http://localhost:3000/entrypoints/${endpoint}/invoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          return Response.json({ error: `HTTP ${response.status}` }, { status: response.status });
        }
        
        const data = await response.json();
        return Response.json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
          },
        });
      } catch (error) {
        return Response.json({ error: String(error) }, { status: 503 });
      }
    },

    // Proxy syndicate entrypoints
    "/api/syndicate/:port/entrypoints/:endpoint/invoke": async (req) => {
      const port = req.params.port;
      const endpoint = req.params.endpoint;
      try {
        const body = await req.json();
        const response = await fetch(`http://localhost:${port}/entrypoints/${endpoint}/invoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        
        if (!response.ok) {
          return Response.json({ error: `HTTP ${response.status}` }, { status: response.status });
        }
        
        const data = await response.json();
        return Response.json(data, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
          },
        });
      } catch (error) {
        return Response.json({ error: String(error) }, { status: 503 });
      }
    },

    // Proxy balance fetching directly from Coinbase CDP REST API
    "/api/balance-cdp": async (req) => {
      try {
        const { address, token } = await req.json();
        if (!address) {
          return Response.json({ error: "Address is required" }, { status: 400 });
        }
        if (!token) {
          return Response.json({ error: "Token address is required" }, { status: 400 });
        }

        // Check if CDP API keys are available
        if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET) {
          console.warn("CDP API keys not found. Check .env file in client directory or parent directory.");
          return Response.json({ 
            error: "CDP API keys not configured",
            message: "CDP_API_KEY_ID and CDP_API_KEY_SECRET are required. Create a .env file in the client directory."
          }, { status: 503 });
        }

        // Use the SDK's listTokenBalances with the specific token
        const { CdpClient } = await import("@coinbase/cdp-sdk");
        const cdp = new CdpClient();
        const NETWORK = "base-sepolia";
        
        try {
          const result = await cdp.evm.listTokenBalances({
            address,
            network: NETWORK,
          });

          if (!result || !result.balances) {
            console.warn(`[balance-cdp] No balances found for address ${address}`);
            return Response.json({
              name: undefined,
              address,
              balance: "0",
              formatted: "0",
              formatted_cash: "$0.00",
            }, {
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST",
              },
            });
          }

          // Find the specific token balance
          const tokenBalance = result.balances.find((b: any) => 
            b.token?.contractAddress?.toLowerCase() === token.toLowerCase()
          );

          const balanceAmount = tokenBalance?.amount?.amount || 0n;
          
          // Format the balance in base units with thousands separator
          const balanceStr = balanceAmount.toString();
          const formatted = Number(balanceStr).toLocaleString('en-US');
          const formatted_cash = Number(balanceStr).toLocaleString('en-US');

          // Try to get account name
          let name: string | undefined;
          try {
            const account = await cdp.evm.getAccount({ address });
            name = account.name;
          } catch (error) {
            // Ignore name fetch errors
          }

          return Response.json({
            name,
            address,
            balance: balanceAmount.toString(),
            formatted,
            formatted_cash,
          }, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST",
            },
          });
        } catch (sdkError) {
          // If SDK fails, return a default balance object instead of crashing
          console.warn(`[balance-cdp] SDK error for ${address}, returning zero balance:`, sdkError);
          return Response.json({
            name: undefined,
            address,
            balance: "0",
            formatted: "0",
            formatted_cash: "$0.00",
          }, {
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST",
            },
          });
        }
      } catch (error) {
        console.error("Balance fetch error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return Response.json({ 
          error: errorMessage,
          message: error instanceof Error ? error.stack : "Unknown error"
        }, { status: 503 });
      }
    },

    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
