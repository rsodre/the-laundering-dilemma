import { Card, CardContent } from "@/components/ui/card";
import { DayCell } from "@/components/DayCell";
import { ServiceStatus } from "@/components/ServiceStatus";
import { SYNDICATES, type BalanceResult, type ActivityData } from "@/lib/api";
import type { SyndicateLaunderOutputType, SyndicateProfileOutputType } from "libs/src/types";
import { DAYS_COUNT } from "libs/src/constants";

type DayData = {
  abstract: string | null;
  syndicateResults: Record<string, SyndicateLaunderOutputType | null>;
};

type ExperimentGridProps = {
  daysData: Record<number, DayData>;
  profiles: Record<string, SyndicateProfileOutputType | null>;
  currentDay: number | null;
  isLoading?: boolean;
  healthStatus: Record<string, boolean>;
  balances: Record<string, { dirty: BalanceResult | null; clean: BalanceResult | null }>;
  activityData: ActivityData | null;
  laundromatAvailable: boolean;
};

export const ExperimentGrid = ({ daysData, profiles, currentDay, isLoading, healthStatus, balances, activityData, laundromatAvailable }: ExperimentGridProps) => {
  // Always use DAYS_COUNT from constants, regardless of activity data length
  const days = Array.from({ length: DAYS_COUNT }, (_, i) => i + 1);

  return (
    <Card>
      <CardContent>
        <div className="mb-4">
          <ServiceStatus
            laundromatAvailable={laundromatAvailable}
            syndicatesAvailable={Object.keys(healthStatus).filter((name) => healthStatus[name]).length}
            totalSyndicates={SYNDICATES.length}
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
                    const isHealthy = healthStatus[syndicate.name] ?? false;
                    return (
                      <th
                        key={syndicate.name}
                        className={`border p-2 text-center font-semibold min-w-[180px] ${
                          isHealthy ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                        }`}
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
                              className={`h-2 w-2 rounded-full ${
                                isHealthy ? "bg-green-600 dark:bg-green-400" : "bg-red-600 dark:bg-red-400"
                              }`}
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
                    const isHealthy = healthStatus[syndicate.name] ?? false;
                    const balance = balances[syndicate.name]?.dirty;
                    const profile = profiles[syndicate.name];
                    const walletAddress = profile?.dirty_wallet_address || balance?.address;
                    return (
                      <th
                        key={`dirty-${syndicate.name}`}
                        className={`border p-2 text-center min-w-[180px] ${
                          isHealthy ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                        }`}
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
                    const isHealthy = healthStatus[syndicate.name] ?? false;
                    const balance = balances[syndicate.name]?.clean;
                    const profile = profiles[syndicate.name];
                    const walletAddress = profile?.clean_wallet_address || balance?.address;
                    return (
                      <th
                        key={`clean-${syndicate.name}`}
                        className={`border p-2 text-center min-w-[180px] ${
                          isHealthy ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                        }`}
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
                  const activityDay = activityData?.days?.find(d => d.day === day);

                  return (
                    <>
                      {/* Abstract row - spans all columns */}
                      {activityDay?.abstract && (
                        <tr key={`abstract-${day}`} className={isCurrentDay ? "bg-primary/5" : ""}>
                          <td colSpan={SYNDICATES.length + 1} className="border p-3 bg-muted/30">
                            <div className="text-sm">
                              <div className="font-semibold mb-1">Day {day} Abstract:</div>
                              <div className="text-muted-foreground whitespace-pre-wrap">{activityDay.abstract}</div>
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

                          return (
                            <td key={`${day}-${syndicate.name}`} className="border p-2">
                              <DayCell
                                day={day}
                                syndicateName={syndicate.name}
                                launderResult={launderResult}
                                isBusted={isBusted}
                                isLoading={isLoading && isCurrentDay}
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

