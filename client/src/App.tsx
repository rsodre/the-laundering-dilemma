import { useState, useEffect, useCallback } from "react";
import { LaundromatStatus } from "@/components/LaundromatStatus";
import { ExperimentGrid } from "@/components/ExperimentGrid";
import { ServiceStatus } from "@/components/ServiceStatus";
import {
  SYNDICATES,
  getSyndicateProfile,
  getLaundromatAbstract,
  checkSyndicateHealth,
  checkLaundromatHealth,
  getBalance,
  type SyndicateInfo,
  type BalanceResult,
} from "@/lib/api";
import type {
  SyndicateProfileOutputType,
  SyndicateLaunderOutputType,
} from "libs/src/types";
import { DAYS_COUNT } from "libs/src/constants";
import "./index.css";

type DayData = {
  abstract: string | null;
  syndicateResults: Record<string, SyndicateLaunderOutputType | null>;
};

export const App = () => {
  const [profiles, setProfiles] = useState<Record<string, SyndicateProfileOutputType | null>>({});
  const [daysData, setDaysData] = useState<Record<number, DayData>>({});
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [isLoadingAbstract, setIsLoadingAbstract] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [laundromatAvailable, setLaundromatAvailable] = useState(false);
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});
  const [balances, setBalances] = useState<Record<string, { dirty: BalanceResult | null; clean: BalanceResult | null }>>({});

  const loadSyndicateProfile = useCallback(async (syndicate: SyndicateInfo) => {
    try {
      const profile = await getSyndicateProfile(syndicate);
      setProfiles((prev) => ({
        ...prev,
        [syndicate.name]: profile,
      }));

      // Fetch balances for this syndicate
      try {
        // Ensure we have valid addresses
        if (!profile.dirty_wallet_address || !profile.clean_wallet_address) {
          console.warn(`[${syndicate.name}] Missing wallet addresses in profile`);
          setBalances((prev) => ({
            ...prev,
            [syndicate.name]: {
              dirty: null,
              clean: null,
            },
          }));
          return;
        }

        console.log(`[${syndicate.name}] Fetching balances for:`, {
          dirty: profile.dirty_wallet_address,
          clean: profile.clean_wallet_address,
        });

        const [dirtyBalance, cleanBalance] = await Promise.all([
          getBalance(profile.dirty_wallet_address),
          getBalance(profile.clean_wallet_address),
        ]);

        console.log(`[${syndicate.name}] Balance results:`, {
          dirty: {
            address: dirtyBalance.address,
            balance: dirtyBalance.balance.toString(),
            formatted: dirtyBalance.formatted_cash,
            full: dirtyBalance,
          },
          clean: {
            address: cleanBalance.address,
            balance: cleanBalance.balance.toString(),
            formatted: cleanBalance.formatted_cash,
            full: cleanBalance,
          },
        });

        // Verify we got the correct addresses back
        if (dirtyBalance.address !== profile.dirty_wallet_address) {
          console.warn(`[${syndicate.name}] Dirty balance address mismatch: expected ${profile.dirty_wallet_address}, got ${dirtyBalance.address}`);
        }
        if (cleanBalance.address !== profile.clean_wallet_address) {
          console.warn(`[${syndicate.name}] Clean balance address mismatch: expected ${profile.clean_wallet_address}, got ${cleanBalance.address}`);
        }

        setBalances((prev) => {
          const updated = {
            ...prev,
            [syndicate.name]: {
              dirty: dirtyBalance,
              clean: cleanBalance,
            },
          };
          console.log(`[${syndicate.name}] Updated balances state:`, Object.keys(updated));
          return updated;
        });
      } catch (balanceError) {
        console.error(`[${syndicate.name}] Failed to fetch balances:`, balanceError);
        setBalances((prev) => ({
          ...prev,
          [syndicate.name]: {
            dirty: null,
            clean: null,
          },
        }));
      }
    } catch (error) {
      // Silently handle network errors when services aren't available
      // Only log if it's not a network/connection error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("Service unavailable") && !errorMessage.includes("Failed to fetch")) {
        console.error(`Failed to load profile for ${syndicate.name}:`, error);
      }
    }
  }, []);

  const loadAllProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      await Promise.all(SYNDICATES.map((syndicate) => loadSyndicateProfile(syndicate)));
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [loadSyndicateProfile]);

  const loadAbstract = useCallback(async (day: number) => {
    setIsLoadingAbstract(true);
    try {
      const abstractData = await getLaundromatAbstract();
      setDaysData((prev) => ({
        ...prev,
        [day]: {
          ...prev[day] ?? { abstract: null, syndicateResults: {} },
          abstract: abstractData,
        },
      }));
    } catch (error) {
      // Silently handle network errors when services aren't available
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("Service unavailable") && !errorMessage.includes("Failed to fetch")) {
        console.error("Failed to load abstract:", error);
      }
    } finally {
      setIsLoadingAbstract(false);
    }
  }, []);

  const handleRefreshAll = useCallback(async () => {
    await loadAllProfiles();
    if (currentDay !== null) {
      await loadAbstract(currentDay);
    }
  }, [loadAllProfiles, loadAbstract, currentDay]);

  const checkAllHealth = useCallback(async () => {
    // Check laundromat health
    const laundromatHealthy = await checkLaundromatHealth();
    setLaundromatAvailable(laundromatHealthy);

    // Check all syndicate health
    const healthChecks = await Promise.all(
      SYNDICATES.map(async (syndicate) => {
        const isHealthy = await checkSyndicateHealth(syndicate);
        return { name: syndicate.name, isHealthy };
      })
    );

    const newHealthStatus: Record<string, boolean> = {};
    healthChecks.forEach(({ name, isHealthy }) => {
      newHealthStatus[name] = isHealthy;
    });
    
    setHealthStatus(newHealthStatus);
  }, []);


  // Initial load
  useEffect(() => {
    loadAllProfiles();
    // Run health check immediately, then set up interval
    checkAllHealth();
  }, [loadAllProfiles, checkAllHealth]);

  // Health check every 3 seconds
  useEffect(() => {
    // Run immediately, then set up interval
    checkAllHealth();
    const healthInterval = setInterval(() => {
      checkAllHealth();
    }, 3000); // Check health every 3 seconds

    return () => clearInterval(healthInterval);
  }, [checkAllHealth]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      handleRefreshAll();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, handleRefreshAll]);

  const currentAbstract = currentDay !== null ? daysData[currentDay]?.abstract ?? null : null;

  return (
    <div className="container mx-auto p-8 max-w-[1600px]">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">The Laundering Dilemma</h1>
        <p className="text-muted-foreground">
          An Agentic Social Experiment • Prisoner's Dilemma on Base Sepolia
        </p>
      </div>

      <div className="mb-6">
        <ServiceStatus
          laundromatAvailable={laundromatAvailable}
          syndicatesAvailable={Object.keys(profiles).filter((name) => profiles[name] !== null).length}
          totalSyndicates={SYNDICATES.length}
        />
      </div>

      {currentDay !== null && (
        <div className="mb-6">
          <LaundromatStatus
            abstract={currentAbstract}
            isLoading={isLoadingAbstract}
            onRefresh={() => currentDay !== null && loadAbstract(currentDay)}
          />
        </div>
      )}

      <div className="mb-6">
        <ExperimentGrid
          daysData={daysData}
          profiles={profiles}
          currentDay={currentDay}
          isLoading={isLoadingProfiles}
          healthStatus={healthStatus}
          balances={balances}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <label className="flex items-center justify-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="cursor-pointer"
          />
          Auto-refresh every 10 seconds
        </label>
      </div>
    </div>
  );
};

export default App;
