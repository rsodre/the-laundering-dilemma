import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, Loader2 } from "lucide-react";

type ExperimentControlsProps = {
  onRefreshAll?: () => void;
  onLaunderAll?: () => void;
  isLoading?: boolean;
  isLaundering?: boolean;
};

export const ExperimentControls = ({
  onRefreshAll,
  onLaunderAll,
  isLoading,
  isLaundering,
}: ExperimentControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiment Controls</CardTitle>
        <CardDescription>Manual triggers for testing and monitoring</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        {onRefreshAll && (
          <Button
            variant="outline"
            onClick={onRefreshAll}
            disabled={isLoading || isLaundering}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh All
          </Button>
        )}
        {onLaunderAll && (
          <Button
            onClick={onLaunderAll}
            disabled={isLoading || isLaundering}
            className="flex items-center gap-2"
          >
            {isLaundering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Launder All
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

