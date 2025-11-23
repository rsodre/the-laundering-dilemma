import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SyndicateProfileOutputType, SyndicateLaunderOutputType } from "libs/src/types";
import { AlertCircle, CheckCircle2, Wallet, User } from "lucide-react";

type SyndicateCardProps = {
  name: string;
  port: number;
  profile: SyndicateProfileOutputType | null;
  lastLaunder: SyndicateLaunderOutputType | null;
  isLoading?: boolean;
};

export const SyndicateCard = ({
  name,
  port,
  profile,
  lastLaunder,
  isLoading,
}: SyndicateCardProps) => {
  const isBusted = profile?.busted ?? false;
  const statusColor = isBusted ? "destructive" : "default";
  const statusIcon = isBusted ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />;

  return (
    <Card className={`relative ${isBusted ? "opacity-75 border-destructive" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{name}</CardTitle>
            <Badge variant={statusColor} className="flex items-center gap-1">
              {statusIcon}
              {isBusted ? "BUSTED" : "ACTIVE"}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">:{port}</span>
        </div>
        {profile && (
          <CardDescription className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {profile.boss_name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && !profile ? (
          <div className="text-sm text-muted-foreground">Loading profile...</div>
        ) : profile ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Dirty Wallet:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {profile.dirty_wallet_address.slice(0, 10)}...{profile.dirty_wallet_address.slice(-8)}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Clean Wallet:</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {profile.clean_wallet_address.slice(0, 10)}...{profile.clean_wallet_address.slice(-8)}
                </code>
              </div>
            </div>

            {lastLaunder && (
              <div className="pt-2 border-t space-y-2">
                <div className="text-sm font-medium">Last Launder:</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{lastLaunder.strategy}</Badge>
                  {lastLaunder.success ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Success
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Failed</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Cleaned: ${(lastLaunder.amount_clean / 1000).toFixed(2)}</div>
                  <div>Lost: ${(lastLaunder.amount_lost / 1000).toFixed(2)}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No profile data available</div>
        )}
      </CardContent>
    </Card>
  );
};

