import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
            <div className="relative rounded-full">
              <div className="bg-background rounded-full p-[2px]">
                <Avatar className="w-14 h-14">
                  {user?.avatar ? (
                    <AvatarImage src={user.avatar} alt="Your Story" />
                  ) : null}
                  <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </div>
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
              <div
                className={`relative rounded-full p-[2px] ${
                  idx < 4
                    ? "bg-gradient-to-tr from-primary via-chart-4 to-chart-3"
                    : "bg-muted"
                }`}
              >
                <div className="bg-background rounded-full p-[2px]">
                  <Avatar className="w-14 h-14">
                    {storyUser.avatar ? (
                      <AvatarImage src={storyUser.avatar} alt={storyUser.username} />
                    ) : null}
                    <AvatarFallback>{storyUser.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
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
