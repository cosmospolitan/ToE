import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Heart,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post;
  author: User;
}

export function PostCard({ post, author }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [saved, setSaved] = useState(false);
  const [showContent, setShowContent] = useState(post.coinCost === 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <div className="border-b border-border" data-testid={`post-card-${post.id}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          <Avatar className="w-9 h-9">
            <AvatarImage src={author.avatar || ""} alt={author.username} />
            <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          {author.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-primary-foreground fill-primary-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">{author.displayName}</span>
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

      <div className="px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
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

        <Button size="icon" variant="ghost" data-testid={`post-comment-${post.id}`}>
          <MessageCircle className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-repost-${post.id}`}>
          <Repeat2 className="w-5 h-5" />
        </Button>

        <Button size="icon" variant="ghost" data-testid={`post-gift-${post.id}`}>
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
    </div>
  );
}
