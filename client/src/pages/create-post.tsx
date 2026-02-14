import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Image,
  Video,
  Music,
  Lock,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [coinCost, setCoinCost] = useState(0);
  const [showMediaInput, setShowMediaInput] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/posts", {
        content: content.trim(),
        imageUrl: imageUrl.trim() || null,
        coinCost,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post created successfully!" });
      setLocation("/");
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  return (
    <div className="flex flex-col min-h-full" data-testid="page-create-post">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-14">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base font-semibold">Create Post</h1>
          </div>
          <Button
            size="sm"
            disabled={(!content.trim() && !imageUrl.trim()) || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            data-testid="button-publish-post"
          >
            {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
            Post
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={user?.avatar || ""} />
            <AvatarFallback>{(user?.username || "U")[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold">{user?.displayName}</p>
            <p className="text-[10px] text-muted-foreground">@{user?.username}</p>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="resize-none border-0 text-base focus-visible:ring-0 min-h-[120px]"
          data-testid="input-post-content"
        />

        {showMediaInput && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL (e.g. /images/post1.png)"
                className="flex-1 bg-muted rounded-md px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                data-testid="input-image-url"
              />
              <Button size="icon" variant="ghost" onClick={() => { setShowMediaInput(false); setImageUrl(""); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {imageUrl && (
              <img src={imageUrl} alt="Preview" className="w-full rounded-md aspect-video object-cover" />
            )}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-3">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowMediaInput(true)}
            data-testid="button-add-image"
          >
            <Image className="w-5 h-5 text-chart-2" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-add-video">
            <Video className="w-5 h-5 text-chart-4" />
          </Button>
          <Button size="icon" variant="ghost" data-testid="button-add-audio">
            <Music className="w-5 h-5 text-chart-3" />
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <select
              value={coinCost}
              onChange={(e) => setCoinCost(Number(e.target.value))}
              className="bg-muted rounded-md px-2 py-1 text-xs outline-none"
              data-testid="select-coin-cost"
            >
              <option value={0}>Free</option>
              <option value={10}>10 coins</option>
              <option value={25}>25 coins</option>
              <option value={50}>50 coins</option>
              <option value={100}>100 coins</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
