import { Card, CardContent } from "@/components/ui/card";
import { DayCell } from "@/components/DayCell";
import { ServiceStatus } from "@/components/ServiceStatus";
import { SYNDICATES, type BalanceResult, type ActivityData } from "@/lib/api";
import type { SyndicateLaunderOutputType, SyndicateProfileOutputType } from "libs/src/types";
import { DAYS_COUNT } from "libs/src/constants";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

type DayData = {
  abstract: string | null;
  syndicateResults: Record<string, SyndicateLaunderOutputType | null>;
};

type ExperimentGridProps = {
  daysData: Record<number, DayData>;
  profiles: Record<string, SyndicateProfileOutputType | null>;
  currentDay: number | null;
  healthStatus: Record<string, boolean>;
  balances: Record<string, { dirty: BalanceResult | null; clean: BalanceResult | null }>;
  activityData: ActivityData | null;
  laundromatAvailable: boolean;
  seizedBalance: BalanceResult | null;
};

export const ExperimentGrid = ({ daysData, profiles, currentDay, healthStatus, balances, activityData, laundromatAvailable, seizedBalance }: ExperimentGridProps) => {
  // Always use DAYS_COUNT from constants, regardless of activity data length
  const days = Array.from({ length: DAYS_COUNT }, (_, i) => i + 1);
  
  // Track which days are folded/unfolded
  const [foldedDays, setFoldedDays] = useState<Set<number>>(new Set());
  const [previousCurrentDay, setPreviousCurrentDay] = useState<number | null>(null);

  // When currentDay changes, unfold the new day and fold the previous day
  useEffect(() => {
    if (currentDay !== null && currentDay !== previousCurrentDay) {
      setFoldedDays((prev) => {
        const newSet = new Set(prev);
        // Fold the previous day
        if (previousCurrentDay !== null) {
          newSet.add(previousCurrentDay);
        }
        // Unfold the current day
        newSet.delete(currentDay);
        return newSet;
      });
      setPreviousCurrentDay(currentDay);
    }
  }, [currentDay, previousCurrentDay]);

  const toggleDayFold = (day: number) => {
    setFoldedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }
      return newSet;
    });
  };

  // Calculate the highest clean balance to determine which syndicate should be yellow
  const getHighestCleanBalance = (): bigint => {
    let maxBalance = 0n;
    SYNDICATES.forEach((syndicate) => {
      const cleanBalance = balances[syndicate.name]?.clean?.balance;
      if (cleanBalance && cleanBalance > maxBalance) {
        maxBalance = cleanBalance;
      }
    });
    return maxBalance;
  };

  const highestCleanBalance = getHighestCleanBalance();

  // Helper function to determine cell color based on health, busted status, and highest clean balance
  const getCellColorClass = (syndicateName: string): string => {
    const isHealthy = healthStatus[syndicateName] ?? false;
    const profile = profiles[syndicateName];
    const isBusted = profile?.busted ?? false;
    const cleanBalance = balances[syndicateName]?.clean?.balance ?? 0n;
    // Only show yellow if balance is > 0 AND it's the highest AND highest is > 0
    const isHighestClean = cleanBalance > 0n && highestCleanBalance > 0n && cleanBalance === highestCleanBalance;

    // Priority: offline → red, busted → red, highest clean → yellow, online → green
    if (!isHealthy || isBusted) {
      return "bg-red-50 dark:bg-red-950/20";
    }
    if (isHighestClean) {
      return "bg-yellow-50 dark:bg-yellow-950/20";
    }
    return "bg-green-50 dark:bg-green-950/20";
  };

  // Helper function to determine status dot color (only reflects online/offline status)
  const getStatusDotColor = (syndicateName: string): string => {
    const isHealthy = healthStatus[syndicateName] ?? false;
    // Status dot only shows online (green) or offline (red) status
    return isHealthy ? "bg-green-600 dark:bg-green-400" : "bg-red-600 dark:bg-red-400";
  };

  return (
    <Card>
      <CardContent>
        <div className="mb-4">
          <ServiceStatus
            laundromatAvailable={laundromatAvailable}
            syndicatesAvailable={Object.keys(healthStatus).filter((name) => healthStatus[name]).length}
            totalSyndicates={SYNDICATES.length}
            seizedBalance={seizedBalance}
          />
        </div>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-background border p-2 text-left font-semibold min-w-[80px]">
                    Syndicate
                  </th>
                  {SYNDICATES.map((syndicate) => {
                    return (
                      <th
                        key={syndicate.name}
                        className={`border p-2 text-center font-semibold min-w-[180px] ${getCellColorClass(syndicate.name)}`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-semibold">{syndicate.name}</div>
                          {profiles[syndicate.name] && (
                            <div>
                              {profiles[syndicate.name]?.boss_name}
                            </div>
                          )}
                          <div className="flex items-center justify-center gap-1 text-xs font-mono text-muted-foreground">
                            <div
                              className={`h-2 w-2 rounded-full ${getStatusDotColor(syndicate.name)}`}
                            />
                            :{syndicate.port}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  <th className="sticky left-0 z-10 bg-background border p-2 text-left font-semibold min-w-[80px]">
                    Dirty
                  </th>
                  {SYNDICATES.map((syndicate) => {
                    const balance = balances[syndicate.name]?.dirty;
                    const profile = profiles[syndicate.name];
                    const walletAddress = profile?.dirty_wallet_address || balance?.address;
                    return (
                      <th
                        key={`dirty-${syndicate.name}`}
                        className={`border p-2 text-center min-w-[180px] ${getCellColorClass(syndicate.name)}`}
                      >
                        <div 
                          className="text-sm"
                          title={walletAddress ? `Dirty Wallet: ${walletAddress}` : ""}
                          style={{ cursor: walletAddress ? "help" : "default" }}
                        >
                          {balance && balance.formatted_cash ? `$${balance.formatted_cash}` : balance ? "$0.00" : "-"}
                        </div>
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  <th className="sticky left-0 z-10 bg-background border p-2 text-left font-semibold min-w-[80px]">
                    Clean
                  </th>
                  {SYNDICATES.map((syndicate) => {
                    const balance = balances[syndicate.name]?.clean;
                    const profile = profiles[syndicate.name];
                    const walletAddress = profile?.clean_wallet_address || balance?.address;
                    return (
                      <th
                        key={`clean-${syndicate.name}`}
                        className={`border p-2 text-center min-w-[180px] ${getCellColorClass(syndicate.name)}`}
                      >
                        <div 
                          className="text-sm"
                          title={walletAddress ? `Clean Wallet: ${walletAddress}` : ""}
                          style={{ cursor: walletAddress ? "help" : "default" }}
                        >
                          {balance && balance.formatted_cash ? `$${balance.formatted_cash}` : balance ? "$0.00" : "-"}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const dayData = daysData[day];
                  const isCurrentDay = currentDay === day;
                  const activityDay = Array.isArray(activityData?.days) 
                    ? activityData.days.find(d => d.day === day)
                    : undefined;

                  const isFolded = foldedDays.has(day);
                  
                  return (
                    <>
                      {/* Abstract row - spans all columns */}
                      {activityDay?.abstract && (
                        <tr key={`abstract-${day}`} className={isCurrentDay ? "bg-primary/5" : ""}>
                          <td colSpan={SYNDICATES.length + 1} className="border p-3 bg-muted/30">
                            <div className="text-sm">
                              <div 
                                className="font-semibold mb-1 flex items-center gap-2 cursor-pointer hover:text-primary"
                                onClick={() => toggleDayFold(day)}
                              >
                                {isFolded ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                                <span>Day {day} Abstract:</span>
                              </div>
                              {!isFolded && (
                                <div className="text-muted-foreground whitespace-pre-wrap">{activityDay.abstract}</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* Day row with syndicate cells */}
                      <tr
                        key={day}
                        className={isCurrentDay ? "bg-primary/5" : ""}
                      >
                        <td className="sticky left-0 z-10 bg-background border p-2 font-medium text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>Day {day}</span>
                            {isCurrentDay && (
                              <span className="text-xs text-primary font-semibold">● Active</span>
                            )}
                          </div>
                        </td>
                        {SYNDICATES.map((syndicate) => {
                          const launderResult = dayData?.syndicateResults?.[syndicate.name] ?? null;
                          const profile = profiles[syndicate.name];
                          const isBusted = profile?.busted ?? false;
                          const activity = activityDay?.syndicates?.[syndicate.name];
                          
                          // Only show loading if it's the current day, there's no existing data, and syndicate is not busted
                          // Don't show loading based on profile loading state - only show when truly waiting for activity data
                          const hasExistingData = activity || launderResult;
                          // Show loading only if it's current day, no data exists, and not busted
                          // We don't need to check isLoading since activity data updates every second
                          const shouldShowLoading = isCurrentDay && !hasExistingData && !isBusted;

                          return (
                            <td key={`${day}-${syndicate.name}`} className="border p-2">
                              <DayCell
                                day={day}
                                syndicateName={syndicate.name}
                                launderResult={launderResult}
                                isBusted={isBusted}
                                isLoading={shouldShowLoading}
                                activity={activity}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

