import { useQuery } from "@tanstack/react-query";
import { StatusAvatar } from "@/components/status-avatar";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";

export function StoryBar() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: storyUsers } = useQuery<Omit<User, "passwordHash">[]>({
    queryKey: ["/api/stories"],
    enabled: !!user,
  });

  return (
    <div className="py-3 border-b border-border" data-testid="story-bar">
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4">
          <button
            className="flex flex-col items-center gap-1.5 min-w-[64px]"
            data-testid="story-add"
            onClick={() => setLocation("/create")}
          >
            <div className="relative">
              <StatusAvatar
                src={user?.avatar}
                fallback={user?.username || "U"}
                size="lg"
                status={user?.status}
                isOnline={user?.isOnline}
                lastSeen={user?.lastSeen}
                showStatus={false}
              />
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
              Add Story
            </span>
          </button>

          {(storyUsers || []).map((storyUser, idx) => (
            <button
              key={storyUser.id}
              className="flex flex-col items-center gap-1.5 min-w-[64px]"
              data-testid={`story-${storyUser.id}`}
              onClick={() => setLocation(`/profile/${storyUser.id}`)}
            >
              <StatusAvatar
                src={storyUser.avatar}
                fallback={storyUser.username}
                size="lg"
                status={storyUser.status}
                isOnline={storyUser.isOnline}
                lastSeen={storyUser.lastSeen}
                showStatus={true}
                hasStory={true}
                storyViewed={idx >= 4}
              />
              <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
                {storyUser.username}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
