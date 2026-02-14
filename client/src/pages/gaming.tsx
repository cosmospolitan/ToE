import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import type { Game } from "@shared/schema";

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

export default function Gaming() {
  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

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
        <ScrollArea className="w-full">
          <div className="flex gap-2 px-4 pt-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.label}
                  variant={cat.active ? "default" : "secondary"}
                  size="sm"
                  className="shrink-0"
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

        <div className="px-4">
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

        <div className="px-4">
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

        <div className="px-4">
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
      </div>
    </div>
  );
}
