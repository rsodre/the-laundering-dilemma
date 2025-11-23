import type {
  SyndicateProfileOutputType,
  SyndicateLaunderOutputType,
  LaundromatAbstractOutputType,
} from "libs/src/types";
import { SYNDICATE_COUNT } from "libs/src/constants";

const LAUNDROMAT_URL = "http://localhost:3000";
const BASE_PORT = 3101;

export type SyndicateInfo = {
  name: string;
  port: number;
  profileEndpoint: string;
  launderEndpoint: string;
};

export const SYNDICATES: SyndicateInfo[] = Array.from({ length: SYNDICATE_COUNT }, (_, index) => ({
  name: `Syndicate${index + 1}`,
  port: BASE_PORT + index,
  profileEndpoint: `http://localhost:${BASE_PORT + index}/entrypoints/profile/invoke`,
  launderEndpoint: `http://localhost:${BASE_PORT + index}/entrypoints/launder/invoke`,
}));

const fetcher = async <T>(url: string, input: any = {}, useProxy: boolean = false): Promise<T> => {
  try {
    // If useProxy is true, convert the URL to use proxy routes
    let proxyUrl = url;
    if (useProxy) {
      if (url.includes("localhost:3000")) {
        // Laundromat endpoint
        const match = url.match(/\/entrypoints\/([^/]+)\/invoke/);
        if (match) {
          proxyUrl = `/api/laundromat/entrypoints/${match[1]}/invoke`;
        }
      } else {
        // Syndicate endpoint
        const match = url.match(/localhost:(\d+)\/entrypoints\/([^/]+)\/invoke/);
        if (match) {
          const port = match[1];
          const endpoint = match[2];
          proxyUrl = `/api/syndicate/${port}/entrypoints/${endpoint}/invoke`;
        }
      }
    }

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    return body.output as T;
  } catch (error) {
    // Re-throw with more context for network errors
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(`Service unavailable: Unable to connect to ${url}`);
    }
    throw error;
  }
};

export const getSyndicateProfile = async (
  syndicate: SyndicateInfo
): Promise<SyndicateProfileOutputType> => {
  return fetcher<SyndicateProfileOutputType>(syndicate.profileEndpoint, {}, true);
};

export const getSyndicateLaunder = async (
  syndicate: SyndicateInfo,
  abstract: string
): Promise<SyndicateLaunderOutputType> => {
  return fetcher<SyndicateLaunderOutputType>(syndicate.launderEndpoint, { abstract }, true);
};

export const getLaundromatAbstract = async (): Promise<string> => {
  const result = await fetcher<LaundromatAbstractOutputType>(
    `${LAUNDROMAT_URL}/entrypoints/abstract/invoke`,
    {},
    true
  );
  return result.abstract;
};

export const checkSyndicateHealth = async (syndicate: SyndicateInfo): Promise<boolean> => {
  // Use proxy route to avoid CORS issues
  const url = `/api/health/${syndicate.port}`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    // Even if response.ok is false, we should still check the JSON body
    // because the proxy might return 503 with { ok: false } when the service is down
    const data = await response.json();
    
    // Check if data exists and has ok property set to true
    const isHealthy = data != null && typeof data === "object" && typeof data.ok === "boolean" && data.ok === true;
    
    return isHealthy;
  } catch (error) {
    // Silently return false on error (network error, JSON parse error, etc.)
    return false;
  }
};

export const checkLaundromatHealth = async (): Promise<boolean> => {
  // Use proxy route to avoid CORS issues
  const url = `/api/health/3000`;
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });
    
    // Even if response.ok is false, we should still check the JSON body
    // because the proxy might return 503 with { ok: false } when the service is down
    const data = await response.json();
    
    // Check if data exists and has ok property set to true
    const isHealthy = data != null && typeof data === "object" && typeof data.ok === "boolean" && data.ok === true;
    
    return isHealthy;
  } catch (error) {
    // Silently return false on error (network error, JSON parse error, etc.)
    return false;
  }
};

export type BalanceResult = {
  name?: string;
  address: string;
  balance: bigint;
  formatted: string;
  formatted_cash: string;
};

export type ActivityData = {
  currentDay: number | null;
  authority_balance?: number;
  days: Array<{
    day: number;
    abstract: string | null;
    syndicates: Record<string, {
      strategy: string;
      amount_clean: number;
      amount_lost: number;
      dirty_balance?: number;
      clean_balance?: number;
      busted: boolean;
      success: boolean;
    }>;
  }>;
};

export const getActivityData = async (): Promise<ActivityData> => {
  const response = await fetch("/api/activity", {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch activity: ${response.status}`);
  }

  return await response.json();
};

