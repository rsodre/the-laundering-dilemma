import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ServiceStatusProps = {
  laundromatAvailable: boolean;
  syndicatesAvailable: number;
  totalSyndicates: number;
};

export const ServiceStatus = ({
  laundromatAvailable,
  syndicatesAvailable,
  totalSyndicates,
}: ServiceStatusProps) => {
  const allServicesUp = laundromatAvailable && syndicatesAvailable === totalSyndicates;

  return (
    <div className="py-2 mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {allServicesUp ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          )}
          <span className="text-sm font-medium">Service Status</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Laundromat</span>
            <Badge 
              variant={laundromatAvailable ? "default" : "destructive"}
              className={`text-xs ${laundromatAvailable ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {laundromatAvailable ? "Online" : "Offline"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Syndicates</span>
            <Badge 
              variant={syndicatesAvailable === totalSyndicates ? "default" : "destructive"}
              className={`text-xs ${syndicatesAvailable === totalSyndicates ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {syndicatesAvailable} / {totalSyndicates} Online
            </Badge>
          </div>
        </div>
      </div>
      {!allServicesUp && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Some services are unavailable. Make sure all agents are running (check mprocs or start them manually).
          </p>
        </div>
      )}
    </div>
  );
};

