import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allServicesUp ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          )}
          Service Status
        </CardTitle>
        <CardDescription>Agent availability check</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Laundromat</span>
          <Badge 
            variant={laundromatAvailable ? "default" : "destructive"}
            className={laundromatAvailable ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {laundromatAvailable ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Syndicates</span>
          <Badge 
            variant={syndicatesAvailable === totalSyndicates ? "default" : "destructive"}
            className={syndicatesAvailable === totalSyndicates ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {syndicatesAvailable} / {totalSyndicates} Online
          </Badge>
        </div>
        {!allServicesUp && (
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Some services are unavailable. Make sure all agents are running (check mprocs or start them manually).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

