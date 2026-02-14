import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const stories = [
  { id: "add", name: "Your Story", avatar: "/images/avatar1.png", isAdd: true, hasNew: false },
  { id: "1", name: "alex_dev", avatar: "/images/avatar2.png", isAdd: false, hasNew: true },
  { id: "2", name: "sarah_art", avatar: "/images/avatar3.png", isAdd: false, hasNew: true },
  { id: "3", name: "crypto_k", avatar: "/images/avatar1.png", isAdd: false, hasNew: true },
  { id: "4", name: "gamer_x", avatar: "/images/avatar2.png", isAdd: false, hasNew: false },
  { id: "5", name: "dev_nina", avatar: "/images/avatar3.png", isAdd: false, hasNew: true },
  { id: "6", name: "trader_j", avatar: "/images/avatar1.png", isAdd: false, hasNew: false },
];

export function StoryBar() {
  return (
    <div className="py-3 border-b border-border" data-testid="story-bar">
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-4">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-1.5 min-w-[64px]"
              data-testid={`story-${story.id}`}
            >
              <div
                className={`relative rounded-full p-[2px] ${
                  story.hasNew
                    ? "bg-gradient-to-tr from-primary via-chart-4 to-chart-3"
                    : story.isAdd
                    ? ""
                    : "bg-muted"
                }`}
              >
                <div className="bg-background rounded-full p-[2px]">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={story.avatar} alt={story.name} />
                    <AvatarFallback>{story.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                {story.isAdd && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                    <Plus className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground truncate w-16 text-center">
                {story.isAdd ? "Add Story" : story.name}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
}
