import { Badge } from "@/components/ui/badge";
import type { SyndicateLaunderOutputType } from "libs/src/types";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type DayCellProps = {
  day: number;
  syndicateName: string;
  launderResult: SyndicateLaunderOutputType | null;
  isBusted: boolean;
  isLoading?: boolean;
};

export const DayCell = ({ day, syndicateName, launderResult, isBusted, isLoading }: DayCellProps) => {
  if (isLoading) {
    return (
      <div className="p-3 border rounded-lg bg-muted/50 flex items-center justify-center min-h-[100px]">
        <div className="text-xs text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isBusted) {
    return (
      <div className="p-3 border rounded-lg bg-destructive/10 border-destructive/50 flex flex-col items-center justify-center min-h-[100px] gap-2">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div className="text-xs font-medium text-destructive">BUSTED</div>
      </div>
    );
  }

  if (!launderResult) {
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
        launderResult.success ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
      )}
    >
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {launderResult.strategy}
        </Badge>
        {launderResult.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Cleaned:</span>
          <span className="font-medium">${(launderResult.amount_clean / 1000).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Lost:</span>
          <span className="font-medium text-red-600 dark:text-red-400">
            ${(launderResult.amount_lost / 1000).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

