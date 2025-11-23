import { Badge } from "@/components/ui/badge";
import type { SyndicateLaunderOutputType } from "libs/src/types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const getStrategyEmoji = (strategy: string | undefined): string => {
  if (!strategy) return "";
  const normalized = strategy.toLowerCase().replace(/_/g, " ");
  if (normalized.includes("aggressive")) return "💸💸💸";
  if (normalized.includes("moderate")) return "💸💸";
  if (normalized.includes("conservative")) return "💸";
  if (normalized.includes("play nice") || normalized.includes("play_nice")) return "🐓";
  return "";
};

type DayCellProps = {
  day: number;
  syndicateName: string;
  launderResult: SyndicateLaunderOutputType | null;
  isBusted: boolean;
  isLoading?: boolean;
  activity?: {
    strategy: string;
    amount_clean: number;
    amount_lost: number;
    busted: boolean;
    success: boolean;
  } | null;
};

export const DayCell = ({ day, syndicateName, launderResult, isBusted, isLoading, activity }: DayCellProps) => {
  if (isLoading) {
    // If busted, show BUSTED! instead of Laundering...
    if (isBusted) {
      return (
        <div className="p-3 border rounded-lg flex flex-col gap-2 min-h-[100px] bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <div className="text-xs font-medium text-red-600 dark:text-red-400 text-center mt-auto">
            BUSTED!
          </div>
        </div>
      );
    }
    return (
      <div className="p-3 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
        <div className="text-xs text-muted-foreground">Laundering...</div>
      </div>
    );
  }

  // Use activity data if available, otherwise fall back to launderResult
  const displayData = activity || launderResult;
  const isBustedDisplay = activity?.busted ?? isBusted;
  const strategy = activity?.strategy ?? launderResult?.strategy;
  const amountClean = activity?.amount_clean ?? launderResult?.amount_clean ?? 0;
  const amountLost = activity?.amount_lost ?? launderResult?.amount_lost ?? 0;
  const success = activity?.success ?? launderResult?.success ?? false;

        if (isBustedDisplay) {
          return (
            <div className="p-3 border rounded-lg flex flex-col gap-2 min-h-[100px] bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
          {strategy && (
            <Badge variant="outline" className="text-xs capitalize">
              {strategy.replace('_', ' ')} {getStrategyEmoji(strategy)}
            </Badge>
          )}
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
        <div className="text-xs space-y-1">
          {amountLost > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {strategy === "play_nice" ? "Taxed:" : "Lost:"}
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {amountLost.toLocaleString()}
              </span>
            </div>
          )}
        </div>
        <div className="text-xs font-medium text-red-600 dark:text-red-400 text-center mt-1">
          BUSTED!
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="p-3 border rounded-lg bg-muted/30 flex items-center justify-center min-h-[100px]">
        <div className="text-xs text-muted-foreground">-</div>
      </div>
    );
  }

  return (
          <div
            className={cn(
              "p-3 border rounded-lg flex flex-col gap-2 min-h-[100px]",
              success ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
            )}
          >
            <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs capitalize">
          {strategy?.replace('_', ' ')} {strategy && getStrategyEmoji(strategy)}
        </Badge>
        {success ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cleaned:</span>
          <span className="font-medium">{amountClean.toLocaleString()}</span>
        </div>
        {amountLost > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {strategy === "play_nice" ? "Taxed:" : "Lost:"}
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {amountLost.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

