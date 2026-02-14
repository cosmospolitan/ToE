import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Coins,
  MessageCircle,
  Repeat2,
  Gift,
  Send,
  Star,
  Heart,
  Bookmark,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Post, User, Comment } from "@shared/schema";

export default function PostDetail() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/post/:id");
  const postId = params?.id;
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading } = useQuery<Post & { author: User }>({
    queryKey: ["/api/posts", postId],
    enabled: !!postId,
  });

  const { data: postComments } = useQuery<(Comment & { author: User })[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: !!postId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${postId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      setCommentText("");
    },
  });

  if (isLoading) {
    return (
      <div className="pb-20" data-testid="page-post-detail">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-full" data-testid="page-post-detail">
        <p className="text-muted-foreground">Post not found</p>
        <Button variant="ghost" className="mt-2" onClick={() => setLocation("/")}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32" data-testid="page-post-detail">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90 flex items-center gap-3 px-4 h-14"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-base font-semibold">Post</h1>
      </header>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setLocation(`/profile/${post.author.id}`)}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author.avatar || ""} />
              <AvatarFallback>{post.author.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setLocation(`/profile/${post.author.id}`)} className="font-semibold text-sm truncate">
                {post.author.displayName}
              </button>
              {post.author.isVerified && (
                <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">@{post.author.username}</p>
          </div>
        </div>

        {post.content && <p className="text-sm leading-relaxed mb-3">{post.content}</p>}

        {post.imageUrl && (
          <img src={post.imageUrl} alt="" className="w-full rounded-md mb-3 aspect-[4/3] object-cover" />
        )}

        <div className="flex items-center gap-4 py-3 border-t border-b border-border">
          <button
            onClick={() => likeMutation.mutate()}
            className="flex items-center gap-1.5"
            data-testid="button-like-post"
          >
            <Coins className="w-5 h-5" />
            <span className="text-sm">{post.likes || 0}</span>
          </button>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm">{post.reposts || 0}</span>
          </div>
          <div className="flex-1" />
          <Bookmark className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        <h3 className="text-sm font-semibold">Comments</h3>
        {postComments && postComments.length > 0 ? (
          postComments.map((comment) => (
            <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
              <button onClick={() => setLocation(`/profile/${comment.author.id}`)}>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.avatar || ""} />
                  <AvatarFallback>{comment.author.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold">{comment.author.displayName}</span>
                  <span className="text-[10px] text-muted-foreground">@{comment.author.username}</span>
                </div>
                <p className="text-sm mt-0.5">{comment.content}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
        )}
      </div>

      {user && (
        <div
          className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && commentText.trim() && commentMutation.mutate(commentText.trim())}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                data-testid="input-comment"
              />
            </div>
            <Button
              size="icon"
              disabled={!commentText.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate(commentText.trim())}
              data-testid="button-send-comment"
            >
              {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
