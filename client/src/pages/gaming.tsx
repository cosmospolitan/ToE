import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Gamepad2,
  Play,
  Users,
  Star,
  Flame,
  Trophy,
  Zap,
  Radio,
  ChevronRight,
  Crown,
  Coins,
  Clock,
  Swords,
  ArrowLeft,
  Medal,
  Timer,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Game, Tournament, TournamentEntry, User } from "@shared/schema";

const categories = [
  { label: "All", icon: Gamepad2, active: true },
  { label: "Action", icon: Zap, active: false },
  { label: "Strategy", icon: Trophy, active: false },
  { label: "Puzzle", icon: Gamepad2, active: false },
  { label: "Racing", icon: Flame, active: false },
];

const featuredGames = [
  {
    title: "Cyber Arena",
    category: "Action",
    players: 12400,
    rating: 48,
    isLive: true,
    gradient: "from-purple-600/80 to-blue-600/80",
  },
  {
    title: "Chain Masters",
    category: "Strategy",
    players: 8200,
    rating: 46,
    isLive: false,
    gradient: "from-amber-600/80 to-red-600/80",
  },
];

function getTimeLeft(endsAt: string | Date | null) {
  if (!endsAt) return "N/A";
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

type TournamentWithMeta = Tournament & { entries?: (TournamentEntry & { user: User })[]; joined?: boolean };

export default function Gaming() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const { data: tournamentList, isLoading: tournamentsLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const { data: tournamentDetail } = useQuery<TournamentWithMeta>({
    queryKey: ["/api/tournaments", selectedTournament],
    enabled: !!selectedTournament,
  });

  const joinMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/tournaments/${id}/join`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Joined Tournament", description: "Good luck! Compete to earn prizes." });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to join", variant: "destructive" });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/tournaments/${id}/leave`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", selectedTournament] });
      toast({ title: "Left Tournament" });
    },
  });

  if (selectedTournament && tournamentDetail) {
    return (
      <div className="flex flex-col min-h-full pb-20" data-testid="page-tournament-detail">
        <header
          className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-3 px-4 h-14">
            <Button size="icon" variant="ghost" onClick={() => setSelectedTournament(null)} data-testid="button-back-tournaments">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base font-semibold truncate flex-1">{tournamentDetail.title}</h1>
            <Badge
              variant={tournamentDetail.status === "active" ? "default" : "secondary"}
              className="shrink-0"
            >
              {tournamentDetail.status === "active" ? "LIVE" : "Upcoming"}
            </Badge>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <Card data-testid="tournament-info">
            <CardContent className="p-4">
              <div
                className="rounded-md p-4 mb-4"
                style={{ background: "linear-gradient(135deg, hsl(270 76% 35%), hsl(340 80% 35%))" }}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="text-white/70 text-xs mb-1">Prize Pool</p>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-chart-3" />
                      <span className="text-2xl font-bold text-white">{tournamentDetail.prizePool?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs mb-1">Time Left</p>
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4 text-white/80" />
                      <span className="text-lg font-semibold text-white">{getTimeLeft(tournamentDetail.endsAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white/60 text-[10px]">Players</p>
                    <p className="text-sm font-medium text-white">{tournamentDetail.currentPlayers}/{tournamentDetail.maxPlayers}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px]">Entry Fee</p>
                    <p className="text-sm font-medium text-white">{(tournamentDetail.entryFee || 0) === 0 ? "FREE" : `${tournamentDetail.entryFee} coins`}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px]">Game</p>
                    <p className="text-sm font-medium text-white">{tournamentDetail.gameTitle}</p>
                  </div>
                </div>
              </div>

              <Progress
                value={((tournamentDetail.currentPlayers || 0) / (tournamentDetail.maxPlayers || 100)) * 100}
                className="h-1.5 mb-3"
              />
              <p className="text-xs text-muted-foreground mb-4">{tournamentDetail.description}</p>

              {tournamentDetail.joined ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => leaveMutation.mutate(tournamentDetail.id)}
                  disabled={leaveMutation.isPending}
                  data-testid="button-leave-tournament"
                >
                  {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Swords className="w-4 h-4 mr-2" />}
                  Leave Tournament
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => joinMutation.mutate(tournamentDetail.id)}
                  disabled={joinMutation.isPending}
                  data-testid="button-join-tournament"
                >
                  {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Swords className="w-4 h-4 mr-2" />}
                  {(tournamentDetail.entryFee || 0) > 0 ? `Join (${tournamentDetail.entryFee} coins)` : "Join Free"}
                </Button>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-chart-3" />
              <h3 className="text-sm font-semibold">Prize Distribution</h3>
            </div>
            <Card>
              <CardContent className="p-3 space-y-2">
                {[
                  { place: "1st", pct: 50, icon: Crown, color: "text-chart-3" },
                  { place: "2nd", pct: 30, icon: Medal, color: "text-muted-foreground" },
                  { place: "3rd", pct: 20, icon: Medal, color: "text-chart-4" },
                ].map((p) => {
                  const Icon = p.icon;
                  const amount = Math.floor((tournamentDetail.prizePool || 0) * p.pct / 100);
                  return (
                    <div key={p.place} className="flex items-center justify-between gap-2" data-testid={`prize-${p.place}`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${p.color}`} />
                        <span className="text-sm font-medium">{p.place} Place</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-3 h-3 text-chart-3" />
                        <span className="text-sm font-semibold">{amount.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">({p.pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Leaderboard</h3>
            </div>
            <Card>
              <CardContent className="p-3">
                {(tournamentDetail.entries || []).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No players yet. Be the first to join!</p>
                ) : (
                  <div className="space-y-2">
                    {(tournamentDetail.entries || []).map((entry, idx) => (
                      <div key={entry.id} className="flex items-center gap-3" data-testid={`leaderboard-entry-${idx}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${idx === 0 ? "bg-chart-3/20" : "bg-muted"}`}>
                          {idx === 0 ? (
                            <Crown className="w-3.5 h-3.5 text-chart-3" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                          )}
                        </div>
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="text-xs">{entry.user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.user.displayName}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{(entry.score || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-gaming">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <h1 className="text-base font-semibold">Games</h1>
          <div className="flex-1" />
          <Button size="sm" variant="outline" data-testid="button-leaderboard">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Ranks
          </Button>
        </div>
      </header>

      <div className="space-y-4 pb-4">
        <Tabs defaultValue="games" className="w-full">
          <div className="px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="games" className="flex-1 gap-1" data-testid="tab-games">
                <Gamepad2 className="w-3.5 h-3.5" />
                Games
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex-1 gap-1" data-testid="tab-tournaments">
                <Trophy className="w-3.5 h-3.5" />
                Tournaments
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="games" className="mt-3">
            <ScrollArea className="w-full">
              <div className="flex gap-2 px-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.label;
                  return (
                    <Button
                      key={cat.label}
                      variant={isActive ? "default" : "secondary"}
                      size="sm"
                      className="shrink-0"
                      onClick={() => setActiveCategory(cat.label)}
                      data-testid={`category-${cat.label.toLowerCase()}`}
                    >
                      <Icon className="w-3.5 h-3.5 mr-1" />
                      {cat.label}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>

            <div className="px-4 mt-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold">Featured</h3>
                <Badge variant="secondary" className="text-[10px] gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-destructive" />
                  Hot
                </Badge>
              </div>
              <div className="space-y-3">
                {featuredGames.map((game) => (
                  <Card
                    key={game.title}
                    className="overflow-visible hover-elevate"
                    data-testid={`featured-game-${game.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <CardContent className="p-0">
                      <div
                        className="relative h-36 rounded-t-md flex items-end p-4"
                        style={{
                          background: game.gradient.includes("purple")
                            ? "linear-gradient(135deg, hsl(270 76% 40%), hsl(200 85% 40%))"
                            : "linear-gradient(135deg, hsl(45 93% 40%), hsl(0 84% 40%))",
                        }}
                      >
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          {game.isLive && (
                            <Badge variant="destructive" className="text-[10px] gap-0.5">
                              <Radio className="w-2.5 h-2.5" />
                              LIVE
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">{game.title}</h4>
                          <p className="text-xs text-white/70">{game.category}</p>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {game.players.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="w-3 h-3 fill-chart-3 text-chart-3" />
                            {(game.rating / 10).toFixed(1)}
                          </span>
                        </div>
                        <Button size="sm" data-testid={`button-play-${game.title.toLowerCase().replace(" ", "-")}`}>
                          <Play className="w-3.5 h-3.5 mr-1 fill-primary-foreground" />
                          Play
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="px-4 mt-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold">All Games</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  See all
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="h-24 rounded-t-md" />
                        <div className="p-2.5 space-y-1.5">
                          <Skeleton className="h-3.5 w-20" />
                          <Skeleton className="h-3 w-14" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : games && games.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {games.map((game, idx) => {
                    const gradients = [
                      "linear-gradient(135deg, hsl(270 60% 35%), hsl(310 60% 35%))",
                      "linear-gradient(135deg, hsl(200 70% 35%), hsl(170 60% 35%))",
                      "linear-gradient(135deg, hsl(30 80% 40%), hsl(10 70% 40%))",
                      "linear-gradient(135deg, hsl(140 50% 30%), hsl(180 60% 35%))",
                    ];
                    return (
                      <Card
                        key={game.id}
                        className="overflow-visible hover-elevate"
                        data-testid={`game-card-${game.id}`}
                      >
                        <CardContent className="p-0">
                          <div
                            className="h-24 rounded-t-md flex items-center justify-center relative"
                            style={{ background: gradients[idx % gradients.length] }}
                          >
                            <Gamepad2 className="w-8 h-8 text-white/50" />
                            {game.isLive && (
                              <Badge variant="destructive" className="absolute top-2 right-2 text-[9px] px-1.5 py-0 gap-0.5">
                                <Radio className="w-2 h-2" />
                                LIVE
                              </Badge>
                            )}
                          </div>
                          <div className="p-2.5">
                            <p className="text-sm font-semibold truncate">{game.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Users className="w-2.5 h-2.5" />
                                {(game.players || 0).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-chart-3 text-chart-3" />
                                {((game.rating || 0) / 10).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No games available yet
                </div>
              )}
            </div>

            <div className="px-4 mt-4">
              <h3 className="text-sm font-semibold mb-3">Top Players</h3>
              <Card>
                <CardContent className="p-3 space-y-3">
                  {[
                    { name: "ProGamer_X", score: 12450, rank: 1 },
                    { name: "CryptoKing", score: 10200, rank: 2 },
                    { name: "NightOwl", score: 8900, rank: 3 },
                  ].map((player) => (
                    <div key={player.name} className="flex items-center gap-3" data-testid={`leaderboard-${player.rank}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        player.rank === 1 ? "bg-chart-3/20" : "bg-muted"
                      }`}>
                        {player.rank === 1 ? (
                          <Crown className="w-3.5 h-3.5 text-chart-3" />
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground">{player.rank}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{player.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-primary">{player.score.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tournaments" className="mt-3 px-4 space-y-4">
            <Card
              className="overflow-visible"
              style={{ background: "linear-gradient(135deg, hsl(270 76% 35%), hsl(340 80% 35%))" }}
              data-testid="tournaments-hero"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-chart-3" />
                  <h3 className="text-base font-bold text-white">Play to Earn</h3>
                </div>
                <p className="text-xs text-white/70 mb-3">
                  Compete in tournaments, climb the leaderboard, and win real coin prizes from the prize pool
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white/50 text-[10px]">Active Tournaments</p>
                    <p className="text-lg font-bold text-white">{tournamentList?.filter(t => t.status === "active").length || 0}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px]">Total Prizes</p>
                    <p className="text-lg font-bold text-chart-3">
                      {(tournamentList?.reduce((s, t) => s + (t.prizePool || 0), 0) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {tournamentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-3 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-8 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {(tournamentList || []).filter(t => t.status === "active").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Radio className="w-3.5 h-3.5 text-destructive" />
                      <h3 className="text-sm font-semibold">Active Now</h3>
                    </div>
                    <div className="space-y-3">
                      {(tournamentList || []).filter(t => t.status === "active").map((t) => (
                        <Card
                          key={t.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => setSelectedTournament(t.id)}
                          data-testid={`tournament-card-${t.id}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <p className="text-sm font-semibold">{t.title}</p>
                                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 gap-0.5">
                                    <Radio className="w-2 h-2" />
                                    LIVE
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{t.gameTitle}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                  <Coins className="w-3.5 h-3.5 text-chart-3" />
                                  <span className="text-sm font-bold">{(t.prizePool || 0).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Prize Pool</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Users className="w-2.5 h-2.5" />
                                  {t.currentPlayers}/{t.maxPlayers}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {getTimeLeft(t.endsAt)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {(t.entryFee || 0) === 0 ? "FREE" : `${t.entryFee} coins`}
                                </span>
                              </div>
                              <Button size="sm" data-testid={`button-view-tournament-${t.id}`}>
                                <Swords className="w-3 h-3 mr-1" />
                                Enter
                              </Button>
                            </div>
                            <Progress
                              value={((t.currentPlayers || 0) / (t.maxPlayers || 100)) * 100}
                              className="h-1 mt-2"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {(tournamentList || []).filter(t => t.status === "upcoming").length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-3.5 h-3.5 text-chart-2" />
                      <h3 className="text-sm font-semibold">Upcoming</h3>
                    </div>
                    <div className="space-y-3">
                      {(tournamentList || []).filter(t => t.status === "upcoming").map((t) => (
                        <Card
                          key={t.id}
                          className="hover-elevate cursor-pointer"
                          onClick={() => setSelectedTournament(t.id)}
                          data-testid={`tournament-card-${t.id}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{t.title}</p>
                                <p className="text-xs text-muted-foreground">{t.gameTitle}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="flex items-center gap-1 justify-end">
                                  <Coins className="w-3.5 h-3.5 text-chart-3" />
                                  <span className="text-sm font-bold">{(t.prizePool || 0).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Prize Pool</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Users className="w-2.5 h-2.5" />
                                  {t.currentPlayers}/{t.maxPlayers}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  Starts {getTimeLeft(t.startsAt)}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {(t.entryFee || 0) === 0 ? "FREE" : `${t.entryFee} coins`}
                                </span>
                              </div>
                              <Button size="sm" variant="secondary" data-testid={`button-view-tournament-${t.id}`}>
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
