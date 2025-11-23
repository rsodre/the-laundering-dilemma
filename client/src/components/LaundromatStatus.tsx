import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type LaundromatStatusProps = {
  abstract: string | null;
  isLoading?: boolean;
  onRefresh?: () => void;
};

export const LaundromatStatus = ({ abstract, isLoading, onRefresh }: LaundromatStatusProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Laundromat</CardTitle>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
        </div>
        <CardDescription>Market conditions and daily abstract</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && !abstract ? (
          <div className="text-sm text-muted-foreground">Loading abstract...</div>
        ) : abstract ? (
          <div className="h-[200px] w-full rounded-md border p-4 overflow-y-auto">
            <div className="text-sm whitespace-pre-wrap">{abstract}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No abstract available</div>
        )}
      </CardContent>
    </Card>
  );
};

