import { useQuery } from "@tanstack/react-query";
import { StoryBar } from "@/components/story-bar";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, MessageSquare, Plus, Coins } from "lucide-react";
import type { Post, User } from "@shared/schema";

export default function Feed() {
  const { data: posts, isLoading: postsLoading } = useQuery<(Post & { author: User })[]>({
    queryKey: ["/api/posts"],
  });

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
            <Button size="icon" variant="ghost" data-testid="button-coins">
              <Coins className="w-5 h-5 text-chart-3" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-notifications">
              <Bell className="w-5 h-5" />
            </Button>
            <Button size="icon" variant="ghost" data-testid="button-messages">
              <MessageSquare className="w-5 h-5" />
            </Button>
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

      <Button
        className="fixed bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg"
        style={{ background: "linear-gradient(135deg, hsl(270 76% 52%), hsl(340 80% 55%))" }}
        data-testid="button-create-post"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
