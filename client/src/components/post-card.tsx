import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusAvatar } from "@/components/status-avatar";
import {
  Coins,
  Repeat2,
  MessageCircle,
  Gift,
  Send,
  Star,
  Play,
  Volume2,
  Lock,
  Bookmark,
  MoreHorizontal,
  Video,
  Mic,
  X,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post;
  author: User;
}

const giftOptions = [
  { type: "heart", label: "Heart", amount: 5 },
  { type: "star", label: "Star", amount: 10 },
  { type: "diamond", label: "Diamond", amount: 25 },
  { type: "crown", label: "Crown", amount: 50 },
  { type: "rocket", label: "Rocket", amount: 100 },
];

export function PostCard({ post, author }: PostCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [showContent, setShowContent] = useState(post.coinCost === 0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [customGiftAmount, setCustomGiftAmount] = useState("");

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  const giftMutation = useMutation({
    mutationFn: async ({ giftType, amount }: { giftType: string; amount: number }) => {
      const res = await apiRequest("POST", "/api/gifts", {
        receiverId: author.id,
        postId: post.id,
        giftType,
        amount,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setShowGiftModal(false);
      toast({ title: "Gift Sent!", description: `Your gift was sent to ${author.displayName}` });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message || "Failed to send gift", variant: "destructive" });
    },
  });

  const handleLike = () => {
    if (user) {
      likeMutation.mutate();
    }
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleSendGift = (giftType: string, amount: number) => {
    if (amount > (user?.coins || 0)) {
      toast({ title: "Insufficient coins", variant: "destructive" });
      return;
    }
    giftMutation.mutate({ giftType, amount });
  };

  return (
    <div className="border-b border-border" data-testid={`post-card-${post.id}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusAvatar
          src={author.avatar}
          fallback={author.username}
          size="sm"
          status={author.status}
          isOnline={author.isOnline}
          lastSeen={author.lastSeen}
          showStatus={true}
          onClick={() => setLocation(`/profile/${author.id}`)}
          data-testid={`post-avatar-${post.id}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setLocation(`/profile/${author.id}`)} className="font-semibold text-sm truncate" data-testid={`post-author-${post.id}`}>{author.displayName}</button>
            {author.isVerified && (
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Star className="w-2.5 h-2.5 text-primary-foreground fill-primary-foreground" />
              </div>
            )}
            {(author.rating || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Star className="w-2.5 h-2.5 mr-0.5 fill-chart-3 text-chart-3" />
                {author.rating}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{author.username}</p>
        </div>
        <Button size="icon" variant="ghost" data-testid={`post-menu-${post.id}`}>
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {post.content && (
        <div className="px-4 pb-2">
          <p className="text-sm leading-relaxed">{post.content}</p>
        </div>
      )}

      {post.imageUrl && (
        <div className="relative">
          {!showContent && post.coinCost && post.coinCost > 0 ? (
            <div className="relative aspect-[4/3] bg-muted flex flex-col items-center justify-center gap-3">
              <img
                src={post.imageUrl}
                alt="Post"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "blur(20px)", opacity: 0.4 }}
              />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Lock className="w-8 h-8 text-muted-foreground" />
                <Button
                  variant="default"
                  onClick={() => setShowContent(true)}
                  data-testid={`post-unlock-${post.id}`}
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Unlock for {post.coinCost} coins
                </Button>
              </div>
            </div>
          ) : (
            <img
              src={post.imageUrl}
              alt="Post"
              className="w-full aspect-[4/3] object-cover"
            />
          )}
        </div>
      )}

      {post.videoUrl && (
        <div className="relative aspect-video bg-muted flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <Button
            size="icon"
            variant="ghost"
            className="relative z-10 w-14 h-14 rounded-full bg-primary/90"
          >
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
          </Button>
        </div>
      )}

      {post.audioUrl && (
        <div className="mx-4 mb-2 p-3 rounded-md bg-muted flex items-center gap-3">
          <Button size="icon" variant="default" className="rounded-full w-10 h-10 shrink-0">
            <Play className="w-4 h-4 fill-primary-foreground" />
          </Button>
          <div className="flex-1 h-8 flex items-center">
            <div className="w-full h-1 rounded-full bg-border relative overflow-hidden">
              <div className="absolute left-0 top-0 h-full w-1/3 rounded-full bg-primary" />
            </div>
          </div>
          <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0">2:34</span>
        </div>
      )}

      <div className="px-4 py-2 flex items-center justify-between gap-1">
        <div className="flex items-center gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLike}
            data-testid={`post-like-${post.id}`}
          >
            <Coins
              className={`w-5 h-5 transition-colors ${
                liked ? "text-chart-3 fill-chart-3" : ""
              }`}
            />
          </Button>
          <span className="text-xs font-medium min-w-[20px]">{likeCount}</span>
        </div>

        <Button size="icon" variant="ghost" onClick={() => setLocation(`/post/${post.id}`)} data-testid={`post-comment-${post.id}`}>
          <MessageCircle className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-video-${post.id}`}>
          <Video className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-audio-${post.id}`}>
          <Mic className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-repost-${post.id}`}>
          <Repeat2 className="w-5 h-5" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowGiftModal(true)}
          data-testid={`post-gift-${post.id}`}
        >
          <Gift className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-send-${post.id}`}>
          <Send className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setSaved(!saved)}
          data-testid={`post-save-${post.id}`}
        >
          <Bookmark
            className={`w-5 h-5 transition-colors ${
              saved ? "text-primary fill-primary" : ""
            }`}
          />
        </Button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {likeCount} coins earned
          </span>
          <span className="text-xs text-muted-foreground">
            {post.comments || 0} comments
          </span>
          <span className="text-xs text-muted-foreground">
            {post.reposts || 0} reposts
          </span>
        </div>
      </div>

      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" data-testid="gift-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGiftModal(false)} />
          <div className="relative w-full max-w-lg bg-background border-t border-border rounded-t-xl p-4 pb-8 animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="text-base font-semibold">Send Gift to {author.displayName}</h3>
              <Button size="icon" variant="ghost" onClick={() => setShowGiftModal(false)} data-testid="button-close-gift">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-4 h-4 text-chart-3" />
              <span className="text-sm text-muted-foreground">Your balance: <span className="font-semibold text-foreground">{user?.coins?.toLocaleString() || 0}</span></span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {giftOptions.map((g) => (
                <button
                  key={g.type}
                  onClick={() => handleSendGift(g.type, g.amount)}
                  className="flex flex-col items-center gap-1 p-2 rounded-md border border-border hover-elevate"
                  disabled={giftMutation.isPending}
                  data-testid={`gift-option-${g.type}`}
                >
                  <Gift className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-medium">{g.label}</span>
                  <span className="text-[10px] text-chart-3 font-semibold">{g.amount}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
                <Coins className="w-4 h-4 text-chart-3 mr-2" />
                <input
                  type="number"
                  value={customGiftAmount}
                  onChange={(e) => setCustomGiftAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  data-testid="input-custom-gift"
                />
              </div>
              <Button
                onClick={() => {
                  const amt = parseInt(customGiftAmount);
                  if (amt > 0) handleSendGift("custom", amt);
                }}
                disabled={!customGiftAmount || giftMutation.isPending}
                data-testid="button-send-custom-gift"
              >
                {giftMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
