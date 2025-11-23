import { useState, useEffect, useCallback, useRef } from "react";
import { LaundromatStatus } from "@/components/LaundromatStatus";
import { ExperimentGrid } from "@/components/ExperimentGrid";
import { ServiceStatus } from "@/components/ServiceStatus";
import {
  SYNDICATES,
  getSyndicateProfile,
  getLaundromatAbstract,
  checkSyndicateHealth,
  checkLaundromatHealth,
  getActivityData,
  type SyndicateInfo,
  type BalanceResult,
  type ActivityData,
} from "@/lib/api";
import type {
  SyndicateProfileOutputType,
  SyndicateLaunderOutputType,
} from "libs/src/types";
import { DAYS_COUNT, STARTING_DIRTY_CASH } from "libs/src/constants";
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
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [seizedBalance, setSeizedBalance] = useState<BalanceResult | null>(null); // Authority account balance
  
  // Use ref to track health status without causing callback recreation
  const healthStatusRef = useRef<Record<string, boolean>>({});

  // Calculate balances from activity log data
  const calculateBalancesFromActivity = useCallback((activityData: ActivityData | null) => {
    const newBalances: Record<string, { dirty: BalanceResult | null; clean: BalanceResult | null }> = {};

    // Initialize all syndicates with starting values
    SYNDICATES.forEach((syndicate) => {
      newBalances[syndicate.name] = {
        dirty: {
          address: "",
          balance: BigInt(STARTING_DIRTY_CASH),
          formatted: STARTING_DIRTY_CASH.toLocaleString('en-US'),
          formatted_cash: STARTING_DIRTY_CASH.toLocaleString('en-US'),
        },
        clean: {
          address: "",
          balance: 0n,
          formatted: "0",
          formatted_cash: "0",
        },
      };
    });

    // Update balances from activity log (use latest entry for each syndicate)
    if (activityData && Array.isArray(activityData.days)) {
      // Process days in order - later days will overwrite earlier ones, giving us the latest balance
      activityData.days.forEach((day) => {
        Object.entries(day.syndicates || {}).forEach(([syndicateName, activity]) => {
          if (activity.dirty_balance !== undefined && activity.clean_balance !== undefined) {
            const dirtyBalance = BigInt(activity.dirty_balance);
            const cleanBalance = BigInt(activity.clean_balance);
            
            newBalances[syndicateName] = {
              dirty: {
                address: "",
                balance: dirtyBalance,
                formatted: dirtyBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                formatted_cash: dirtyBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
              },
              clean: {
                address: "",
                balance: cleanBalance,
                formatted: cleanBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                formatted_cash: cleanBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
              },
            };
          }
        });
      });
    }

    setBalances(newBalances);

    // Update authority balance from activity log
    if (activityData && activityData.authority_balance !== undefined) {
      const authorityBalance = BigInt(activityData.authority_balance);
      setSeizedBalance({
        address: "",
        balance: authorityBalance,
        formatted: authorityBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
        formatted_cash: authorityBalance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      });
    } else {
      // Initialize to 0 if not in activity log
      setSeizedBalance({
        address: "",
        balance: 0n,
        formatted: "0",
        formatted_cash: "0",
      });
    }
  }, []);


  // Track which profiles are currently being loaded to prevent duplicate requests
  const loadingProfilesRef = useRef<Set<string>>(new Set());

  const loadSyndicateProfile = useCallback(async (syndicate: SyndicateInfo, force: boolean = false) => {
    // Don't fetch if profile already exists (unless forced)
    if (!force && profiles[syndicate.name] !== null && profiles[syndicate.name] !== undefined) {
      return;
    }

    // Don't fetch if already loading
    if (loadingProfilesRef.current.has(syndicate.name)) {
      return;
    }

    // Mark as loading
    loadingProfilesRef.current.add(syndicate.name);

    try {
      const profile = await getSyndicateProfile(syndicate);
      setProfiles((prev) => ({
        ...prev,
        [syndicate.name]: profile,
      }));
    } catch (error) {
      // Silently handle network errors when services aren't available
      // Don't log 503 errors or service unavailable errors - they're expected when services are offline
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (!errorMessage.includes("Service unavailable") && 
          !errorMessage.includes("Failed to fetch") && 
          !errorMessage.includes("503")) {
        console.error(`Failed to load profile for ${syndicate.name}:`, error);
      }
    } finally {
      // Remove from loading set
      loadingProfilesRef.current.delete(syndicate.name);
    }
  }, [profiles]);

  const loadAllProfiles = useCallback(async () => {
    setIsLoadingProfiles(true);
    try {
      // Only fetch profiles for healthy syndicates that don't have a profile yet
      const healthySyndicates = SYNDICATES.filter(
        (syndicate) => {
          const isHealthy = healthStatus[syndicate.name] ?? false;
          const hasProfile = profiles[syndicate.name] !== null && profiles[syndicate.name] !== undefined;
          return isHealthy && !hasProfile;
        }
      );
      await Promise.all(healthySyndicates.map((syndicate) => loadSyndicateProfile(syndicate)));
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [loadSyndicateProfile, healthStatus, profiles]);

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

  const loadActivityData = useCallback(async () => {
    try {
      const data = await getActivityData();
      setActivityData(data);
      if (data.currentDay !== null) {
        setCurrentDay(data.currentDay);
      }

      // Calculate balances from activity log data (including authority balance)
      calculateBalancesFromActivity(data);
    } catch (error) {
      // Silently handle errors
    }
  }, [calculateBalancesFromActivity]);

  const handleRefreshAll = useCallback(async () => {
    await loadAllProfiles();
    await loadActivityData();
    if (currentDay !== null) {
      await loadAbstract(currentDay);
    }
  }, [loadAllProfiles, loadActivityData, loadAbstract, currentDay]);

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
    const syndicatesToLoad: SyndicateInfo[] = [];
    
    // Use ref to get previous health status without causing dependency issues
    const previousHealthStatus = healthStatusRef.current;
    
    healthChecks.forEach(({ name, isHealthy }) => {
      const wasHealthy = previousHealthStatus[name] ?? false;
      newHealthStatus[name] = isHealthy;
      
      // If syndicate just came online, mark it for loading
      if (isHealthy && !wasHealthy) {
        const syndicate = SYNDICATES.find(s => s.name === name);
        if (syndicate) {
          syndicatesToLoad.push(syndicate);
        }
      }
    });
    
    // Update ref and state
    healthStatusRef.current = newHealthStatus;
    setHealthStatus(newHealthStatus);
    
    // Load profiles immediately for syndicates that just came online (only once per syndicate)
    // Don't await - let them load in parallel
    syndicatesToLoad.forEach((syndicate) => {
      loadSyndicateProfile(syndicate, false);
    });
  }, [loadSyndicateProfile]);

  // Initial load
  useEffect(() => {
    // Run health check first, then load activity data
    // Profiles will be loaded automatically when syndicates come online (handled in checkAllHealth)
    checkAllHealth().then(() => {
      loadActivityData();
    });
  }, [checkAllHealth, loadActivityData]);

  // Health check every 3 seconds
  useEffect(() => {
    // Run immediately, then set up interval
    checkAllHealth();
    const healthInterval = setInterval(() => {
      checkAllHealth();
    }, 3000); // Check health every 3 seconds

    return () => clearInterval(healthInterval);
  }, [checkAllHealth]);

  // Activity data refresh every 1 second (no loading state)
  useEffect(() => {
    if (!autoRefresh) return;

    const activityInterval = setInterval(() => {
      loadActivityData(); // Silent update - no loading state
    }, 1000); // Refresh every 1 second

    return () => clearInterval(activityInterval);
  }, [autoRefresh, loadActivityData]);

  // Profiles are only loaded once when syndicates come online (handled in checkAllHealth)
  // No auto-refresh needed since profiles don't change

  const currentAbstract = currentDay !== null ? daysData[currentDay]?.abstract ?? null : null;

  return (
    <div className="container mx-auto p-8 max-w-[1600px]">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">💸 The Laundering Dilemma 💸</h1>
              <p className="text-muted-foreground">
                An Agentic Social Experiment • The Prisoner's Dilemma on x402
              </p>
      </div>

      <div className="mb-6">
        <ExperimentGrid
          daysData={daysData}
          profiles={profiles}
          currentDay={currentDay}
          healthStatus={healthStatus}
          balances={balances}
          activityData={activityData}
          laundromatAvailable={laundromatAvailable}
          seizedBalance={seizedBalance}
        />
      </div>

      {/* Laundromat status box - hidden for now, can be re-enabled later */}
      {false && (
        <div className="mb-6">
          <LaundromatStatus
            abstract={currentAbstract}
            isLoading={isLoadingAbstract}
            onRefresh={() => {
              if (currentDay !== null) {
                loadAbstract(currentDay);
              } else if (activityData?.currentDay !== null) {
                loadAbstract(activityData.currentDay);
              }
            }}
          />
        </div>
      )}

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
