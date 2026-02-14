import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Puzzle,
  Plus,
  Search,
  Store,
  Code,
  Star,
  Download,
  ArrowRight,
  Zap,
  Globe,
  Shield,
  Layers,
  GitBranch,
  Play,
  Settings,
  ChevronRight,
} from "lucide-react";
import type { Plugin } from "@shared/schema";

const officialPlugins = [
  {
    name: "CryptoPool",
    description: "Decentralized liquidity pooling and yield optimization across multiple chains",
    icon: Layers,
    color: "from-chart-3/20 to-primary/20",
    iconColor: "text-chart-3",
    price: 2500,
    downloads: 12400,
    rating: 48,
  },
  {
    name: "CopyX",
    description: "Advanced copy trading engine with AI-powered strategy replication",
    icon: GitBranch,
    color: "from-chart-2/20 to-primary/20",
    iconColor: "text-chart-2",
    price: 3200,
    downloads: 8900,
    rating: 46,
  },
  {
    name: "UniNations",
    description: "Cross-border payment infrastructure with multi-currency settlement",
    icon: Globe,
    color: "from-chart-4/20 to-primary/20",
    iconColor: "text-chart-4",
    price: 4800,
    downloads: 6300,
    rating: 49,
  },
  {
    name: "MAGA",
    description: "Market Analysis & Growth Automation - predictive analytics suite",
    icon: Shield,
    color: "from-chart-5/20 to-primary/20",
    iconColor: "text-chart-5",
    price: 1800,
    downloads: 15600,
    rating: 47,
  },
];

export default function Workspace() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: plugins, isLoading } = useQuery<Plugin[]>({
    queryKey: ["/api/plugins"],
  });

  const filteredPlugins = plugins?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-workspace">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Puzzle className="w-5 h-5 text-primary" />
          <h1 className="text-base font-semibold">Workspace</h1>
          <div className="flex-1" />
          <Button size="sm" data-testid="button-create-plugin">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex items-center bg-muted rounded-md px-3 py-2.5">
          <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plugins & marketplace..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            data-testid="input-search-plugins"
          />
        </div>

        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="marketplace" className="flex-1 gap-1" data-testid="tab-marketplace">
              <Store className="w-3.5 h-3.5" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="my-plugins" className="flex-1 gap-1" data-testid="tab-my-plugins">
              <Code className="w-3.5 h-3.5" />
              My Plugins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-3 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold">Featured Products</h3>
                <Badge variant="secondary" className="text-[10px]">Official</Badge>
              </div>
              <div className="space-y-3">
                {officialPlugins.map((plugin) => {
                  const Icon = plugin.icon;
                  return (
                    <Card key={plugin.name} className="hover-elevate" data-testid={`plugin-${plugin.name.toLowerCase()}`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0`}
                            style={{ background: `linear-gradient(135deg, hsl(var(--primary) / 0.12), hsl(var(--chart-2) / 0.12))` }}
                          >
                            <Icon className={`w-6 h-6 ${plugin.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold">{plugin.name}</p>
                              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                <Zap className="w-2 h-2 mr-0.5" />
                                Pro
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                              {plugin.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Download className="w-2.5 h-2.5" />
                                {plugin.downloads.toLocaleString()}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-chart-3 text-chart-3" />
                                {(plugin.rating / 10).toFixed(1)}
                              </span>
                              <span className="text-[10px] font-medium text-primary">
                                {plugin.price.toLocaleString()} coins
                              </span>
                            </div>
                          </div>
                          <Button size="sm" variant="default" data-testid={`button-buy-${plugin.name.toLowerCase()}`}>
                            Get
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold">Community Plugins</h3>
                <Button variant="ghost" size="sm" className="text-xs">
                  See all
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredPlugins && filteredPlugins.length > 0 ? (
                <div className="space-y-3">
                  {filteredPlugins.map((plugin) => (
                    <Card key={plugin.id} className="hover-elevate" data-testid={`community-plugin-${plugin.id}`}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <Puzzle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{plugin.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{plugin.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{plugin.downloads} downloads</span>
                            {plugin.price && plugin.price > 0 && (
                              <span className="text-[10px] text-primary">{plugin.price} coins</span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" data-testid={`button-get-${plugin.id}`}>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No plugins found
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-plugins" className="mt-3 space-y-4">
            <Card
              className="border-dashed hover-elevate cursor-pointer"
              data-testid="card-create-plugin"
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-semibold mb-1">Create New Plugin</p>
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Build automation workflows with our visual editor
                </p>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-semibold mb-3">Plugin Editor</h3>
              <Card data-testid="plugin-editor-preview">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                        <Puzzle className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">My Plugin</p>
                        <p className="text-[10px] text-muted-foreground">Draft</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative bg-muted rounded-md p-4 min-h-[200px]">
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-12 rounded-md border border-border bg-background flex items-center justify-center">
                          <Zap className="w-5 h-5 text-chart-3" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Trigger</span>
                      </div>
                      <div className="w-8 h-[2px] bg-border" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-12 rounded-md border border-border bg-background flex items-center justify-center">
                          <Code className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Process</span>
                      </div>
                      <div className="w-8 h-[2px] bg-border" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-12 rounded-md border border-border bg-background flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-chart-2" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Output</span>
                      </div>
                    </div>
                    <button className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-primary font-medium">
                      <Plus className="w-3 h-3" />
                      Add Node
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
