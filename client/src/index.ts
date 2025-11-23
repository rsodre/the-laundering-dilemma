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

    // Activity data endpoint - serves experiment activity data
    "/api/activity": async (req) => {
      try {
        // Option 1: Read from JSON file (if sequencer writes to it)
        // const activityData = await Bun.file("./activity.json").json();
        
        // Option 2: Read from a shared location
        // For now, return empty structure - you can update this to read from your JSON file
        const activityData = {
          currentDay: null,
          days: [] as Array<{
            day: number;
            abstract: string | null;
            syndicateActivities: Record<string, {
              syndicateName: string;
              strategy?: string;
              amountClean?: number;
              amountLost?: number;
              busted?: boolean;
              success?: boolean;
            }>;
          }>,
        };

        // Try to read from activity_log.json
        try {
          const file = Bun.file("./src/data/activity_log.json");
          if (await file.exists()) {
            const fileData = await file.json();
            // Ensure days is always an array
            if (fileData && typeof fileData === 'object') {
              if (!Array.isArray(fileData.days)) {
                fileData.days = [];
              }
              return Response.json(fileData, {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET",
                  "Cache-Control": "no-cache",
                },
              });
            }
          }
        } catch (error) {
          // File doesn't exist or can't be read, return empty structure
        }

        return Response.json(activityData, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Cache-Control": "no-cache",
          },
        });
      } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
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
