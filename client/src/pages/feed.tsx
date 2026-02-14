import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StoryBar } from "@/components/story-bar";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusAvatar } from "@/components/status-avatar";
import { Bell, MessageSquare, Plus, Coins, Search, Wallet, Settings, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import type { Post, User } from "@shared/schema";

export default function Feed() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    refetchInterval: 30000,
  });

  const { data: notifData } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });
  const unreadNotifs = notifData?.filter((n: any) => !n.isRead)?.length || 0;

  const { data: posts, isLoading: postsLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col min-h-full" data-testid="page-feed">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-14">
          <h1
            className="text-xl font-bold"
            style={{ background: "linear-gradient(135deg, hsl(270 76% 58%), hsl(340 80% 55%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            SuperApp
          </h1>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => setLocation("/create")} data-testid="button-create-post">
              <Plus className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setLocation("/search")} data-testid="button-search">
              <Search className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Button size="icon" variant="ghost" onClick={() => setLocation("/notifications")} data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </Button>
              {unreadNotifs > 0 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-destructive flex items-center justify-center px-1">
                  <span className="text-[10px] font-bold text-destructive-foreground">{unreadNotifs > 99 ? "99+" : unreadNotifs}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <Button size="icon" variant="ghost" onClick={() => setLocation("/messages")} data-testid="button-messages">
                <MessageSquare className="w-5 h-5" />
              </Button>
              {(unreadCount?.count || 0) > 0 && (
                <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-destructive flex items-center justify-center px-1">
                  <span className="text-[10px] font-bold text-destructive-foreground">{(unreadCount?.count || 0) > 99 ? "99+" : unreadCount?.count}</span>
                </div>
              )}
            </div>
            <div className="relative" ref={dropdownRef}>
              <StatusAvatar
                src={user?.avatar}
                fallback={user?.username || "U"}
                size="sm"
                status={user?.status}
                isOnline={user?.isOnline}
                lastSeen={user?.lastSeen}
                showStatus={true}
                onClick={() => setShowDropdown(!showDropdown)}
                data-testid="button-account"
              />
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-md shadow-lg z-50" data-testid="account-dropdown">
                  <div className="p-3 border-b border-border">
                    <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Coins className="w-3 h-3 text-chart-3" />
                      <span className="text-xs font-semibold">{user?.coins?.toLocaleString() || 0} coins</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover-elevate"
                      onClick={() => { setShowDropdown(false); setLocation(`/profile/${user?.id}`); }}
                      data-testid="dropdown-profile"
                    >
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      My Profile
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover-elevate"
                      onClick={() => { setShowDropdown(false); setLocation("/balance"); }}
                      data-testid="dropdown-balance"
                    >
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      Balance
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        <Coins className="w-2.5 h-2.5 mr-0.5 text-chart-3" />{user?.coins || 0}
                      </Badge>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover-elevate"
                      onClick={() => { setShowDropdown(false); setLocation("/settings"); }}
                      data-testid="dropdown-settings"
                    >
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      Settings
                      <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                    </button>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-destructive hover-elevate"
                      onClick={() => { setShowDropdown(false); logout(); }}
                      data-testid="dropdown-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <StoryBar />

      <div className="flex-1 pb-20">
        {postsLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                </div>
                <Skeleton className="h-48 w-full rounded-md" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} author={post.author} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>

    </div>
  );
}
