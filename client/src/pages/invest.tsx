import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  TrendingUp,
  Users,
  Puzzle,
  ArrowUpRight,
  Coins,
  Star,
  BarChart3,
  Wallet,
  Loader2,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Investment, User, Plugin } from "@shared/schema";

export default function Invest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investingTarget, setInvestingTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [investAmount, setInvestAmount] = useState("");

  const { data: investments, isLoading: invLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: topUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users/top"],
  });

  const { data: plugins, isLoading: pluginsLoading } = useQuery<Plugin[]>({
    queryKey: ["/api/plugins"],
  });

  const investMutation = useMutation({
    mutationFn: async ({ targetType, targetId, targetName, amount }: { targetType: string; targetId: string; targetName: string; amount: number }) => {
      const res = await apiRequest("POST", "/api/investments", { targetType, targetId, targetName, amount });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setInvestingTarget(null);
      setInvestAmount("");
      toast({ title: "Investment Made", description: "Your investment is now active" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to invest", variant: "destructive" });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/investments/${id}/withdraw`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Withdrawn", description: `${data.withdrawn} coins added to your balance` });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to withdraw", variant: "destructive" });
    },
  });

  const handleInvest = () => {
    if (!investingTarget || !investAmount) return;
    const amount = parseInt(investAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (amount > (user?.coins || 0)) {
      toast({ title: "Insufficient coins", variant: "destructive" });
      return;
    }
    investMutation.mutate({ targetType: investingTarget.type, targetId: investingTarget.id, targetName: investingTarget.name, amount });
  };

  const totalInvested = investments?.reduce((s, i) => s + i.amount, 0) || 0;
  const totalReturns = investments?.reduce((s, i) => s + Math.floor(i.amount * (i.returnRate || 0) / 100), 0) || 0;
  const portfolioValue = totalInvested + totalReturns;
  const overallReturn = totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(1) : "0";

  const portfolioStats = [
    { label: "Total Invested", value: totalInvested.toLocaleString(), icon: Wallet, color: "text-primary" },
    { label: "Returns", value: `${totalReturns >= 0 ? '+' : ''}${totalReturns.toLocaleString()}`, icon: TrendingUp, color: totalReturns >= 0 ? "text-green-500 dark:text-green-400" : "text-destructive" },
    { label: "Active", value: String(investments?.length || 0), icon: BarChart3, color: "text-chart-2" },
  ];

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-invest">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-14">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold">Investments</h1>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Coins className="w-3 h-3 text-chart-3" />
            <span className="text-xs font-semibold">{user?.coins?.toLocaleString() || 0}</span>
          </Badge>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card data-testid="portfolio-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                <p className="text-2xl font-bold">{portfolioValue.toLocaleString()}</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className={`w-3 h-3 ${Number(overallReturn) >= 0 ? "text-green-500 dark:text-green-400" : "text-destructive"}`} />
                <span className={`text-xs ${Number(overallReturn) >= 0 ? "text-green-500 dark:text-green-400" : "text-destructive"}`}>
                  {Number(overallReturn) >= 0 ? '+' : ''}{overallReturn}%
                </span>
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {portfolioStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-sm font-semibold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {investingTarget && (
          <Card data-testid="invest-form">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm font-semibold">Invest in {investingTarget.name}</p>
                <Button size="sm" variant="ghost" onClick={() => { setInvestingTarget(null); setInvestAmount(""); }}>
                  Cancel
                </Button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
                  <Coins className="w-4 h-4 text-chart-3 mr-2" />
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    data-testid="input-invest-amount"
                  />
                </div>
                <Button
                  onClick={handleInvest}
                  disabled={investMutation.isPending || !investAmount}
                  data-testid="button-confirm-invest"
                >
                  {investMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invest"}
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[50, 100, 250, 500].map(amt => (
                  <Button
                    key={amt}
                    size="sm"
                    variant="secondary"
                    onClick={() => setInvestAmount(String(amt))}
                    disabled={amt > (user?.coins || 0)}
                    data-testid={`invest-preset-${amt}`}
                  >
                    {amt}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Available: {user?.coins?.toLocaleString() || 0} coins</p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="users" className="flex-1 gap-1" data-testid="tab-invest-users">
              <Users className="w-3.5 h-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="plugins" className="flex-1 gap-1" data-testid="tab-invest-plugins">
              <Puzzle className="w-3.5 h-3.5" />
              Plugins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-3 space-y-3">
            {usersLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : topUsers && topUsers.length > 0 ? (
              topUsers.map((u) => (
                <Card key={u.id} className="hover-elevate" data-testid={`invest-user-${u.id}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar || ""} />
                      <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">{u.displayName}</p>
                        {u.isVerified && (
                          <Star className="w-3 h-3 fill-chart-3 text-chart-3 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">@{u.username}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          <Star className="w-2 h-2 mr-0.5 fill-chart-3 text-chart-3" />
                          {u.rating}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setInvestingTarget({ type: "user", id: u.id, name: u.displayName })}
                      data-testid={`button-invest-user-${u.id}`}
                    >
                      <Coins className="w-3.5 h-3.5 mr-1" />
                      Invest
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No users available for investment
              </div>
            )}
          </TabsContent>

          <TabsContent value="plugins" className="mt-3 space-y-3">
            {pluginsLoading ? (
              [1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-md" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </CardContent>
                </Card>
              ))
            ) : plugins && plugins.length > 0 ? (
              plugins.map((plugin) => (
                <Card key={plugin.id} className="hover-elevate" data-testid={`invest-plugin-${plugin.id}`}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Puzzle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{plugin.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{plugin.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground">{plugin.downloads} downloads</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          <Star className="w-2 h-2 mr-0.5 fill-chart-3 text-chart-3" />
                          {plugin.rating}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setInvestingTarget({ type: "plugin", id: plugin.id, name: plugin.name })}
                      data-testid={`button-invest-plugin-${plugin.id}`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                      Invest
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No plugins available for investment
              </div>
            )}
          </TabsContent>
        </Tabs>

        {invLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : investments && investments.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold mb-3">Active Investments</h3>
            <div className="space-y-3">
              {investments.map((inv) => (
                <Card key={inv.id} data-testid={`investment-${inv.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          {inv.targetType === "user" ? (
                            <Users className="w-4 h-4 text-primary" />
                          ) : (
                            <Puzzle className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{inv.targetName}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{inv.targetType}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{inv.amount}</p>
                        <p className={`text-[10px] font-medium ${(inv.returnRate || 0) >= 0 ? "text-green-500 dark:text-green-400" : "text-destructive"}`}>
                          {(inv.returnRate || 0) >= 0 ? "+" : ""}{inv.returnRate}%
                        </p>
                      </div>
                    </div>
                    <Progress value={Math.min(100, Math.abs(inv.returnRate || 0) * 3)} className="h-1 mb-2" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        Return: {Math.floor(inv.amount * (1 + (inv.returnRate || 0) / 100)).toLocaleString()} coins
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => withdrawMutation.mutate(inv.id)}
                        disabled={withdrawMutation.isPending}
                        data-testid={`button-withdraw-${inv.id}`}
                      >
                        {withdrawMutation.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 mr-1" />
                        )}
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
