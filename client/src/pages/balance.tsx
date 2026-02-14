import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Landmark,
  Wallet,
  TrendingUp,
  Gift,
  Trophy,
  ShoppingCart,
  Send,
  Plus,
  History,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { Transaction } from "@shared/schema";

const txnIcons: Record<string, typeof Coins> = {
  gift_sent: Gift,
  gift_received: Gift,
  investment: TrendingUp,
  withdraw: ArrowDownRight,
  tournament_entry: Trophy,
  tournament_prize: Trophy,
  purchase: ShoppingCart,
  transfer: Send,
};

const txnColors: Record<string, string> = {
  gift_sent: "text-destructive",
  gift_received: "text-green-500 dark:text-green-400",
  investment: "text-destructive",
  withdraw: "text-green-500 dark:text-green-400",
  tournament_entry: "text-destructive",
  tournament_prize: "text-green-500 dark:text-green-400",
  purchase: "text-destructive",
  transfer: "text-chart-2",
};

export default function Balance() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: transactions, isLoading: txnLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const totalIn = transactions?.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0) || 0;
  const totalOut = transactions?.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) || 0;

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-balance">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold">Balance & Banking</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card data-testid="balance-card">
          <CardContent className="p-0">
            <div
              className="p-5 rounded-t-md"
              style={{ background: "linear-gradient(135deg, hsl(270 76% 35%), hsl(200 85% 35%))" }}
            >
              <p className="text-white/60 text-xs mb-1">Total Balance</p>
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-7 h-7 text-chart-3" />
                <span className="text-3xl font-bold text-white">{user?.coins?.toLocaleString() || 0}</span>
                <span className="text-white/50 text-sm">coins</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white/50 text-[10px]">Income</p>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3 text-green-400" />
                    <span className="text-sm font-medium text-white">{totalIn.toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-white/50 text-[10px]">Spent</p>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3 text-red-400" />
                    <span className="text-sm font-medium text-white">{totalOut.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 flex items-center justify-around gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1" data-testid="button-add-funds">
                <Plus className="w-3.5 h-3.5" />
                Add Funds
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1" data-testid="button-withdraw">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Withdraw
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1" data-testid="button-transfer">
                <Send className="w-3.5 h-3.5" />
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="hover-elevate" data-testid="card-payment">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Payment</p>
                <p className="text-[10px] text-muted-foreground">Cards & methods</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-elevate" data-testid="card-banking">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-chart-2/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-semibold">Banking</p>
                <p className="text-[10px] text-muted-foreground">Bank accounts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="earnings-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Earnings Overview</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <Wallet className="w-4 h-4 mx-auto mb-1 text-primary" />
                <p className="text-sm font-semibold">{user?.coins?.toLocaleString() || 0}</p>
                <p className="text-[10px] text-muted-foreground">Available</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500 dark:text-green-400" />
                <p className="text-sm font-semibold">{totalIn.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Earned</p>
              </div>
              <div className="text-center">
                <Gift className="w-4 h-4 mx-auto mb-1 text-chart-4" />
                <p className="text-sm font-semibold">{transactions?.filter(t => t.type === "gift_received").length || 0}</p>
                <p className="text-[10px] text-muted-foreground">Gifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="w-full">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <History className="w-4 h-4 text-muted-foreground" />
              Transaction History
            </h3>
          </div>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1" data-testid="tab-all-txn">All</TabsTrigger>
            <TabsTrigger value="in" className="flex-1" data-testid="tab-income">Income</TabsTrigger>
            <TabsTrigger value="out" className="flex-1" data-testid="tab-spent">Spent</TabsTrigger>
          </TabsList>

          {["all", "in", "out"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-3 space-y-2">
              {txnLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="w-9 h-9 rounded-md" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : (() => {
                const filtered = (transactions || []).filter(t => {
                  if (tab === "in") return t.amount > 0;
                  if (tab === "out") return t.amount < 0;
                  return true;
                });
                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No transactions yet
                    </div>
                  );
                }
                return filtered.map(txn => {
                  const Icon = txnIcons[txn.type] || Coins;
                  const color = txnColors[txn.type] || "text-foreground";
                  return (
                    <div key={txn.id} className="flex items-center gap-3 py-2" data-testid={`txn-${txn.id}`}>
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">{txn.type.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {txn.createdAt ? new Date(txn.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold ${txn.amount >= 0 ? "text-green-500 dark:text-green-400" : "text-destructive"}`}>
                        {txn.amount >= 0 ? "+" : ""}{txn.amount}
                      </span>
                    </div>
                  );
                });
              })()}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
