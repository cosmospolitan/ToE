import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Settings,
  Star,
  Grid3X3,
  Heart,
  Bookmark,
  MapPin,
  Link2,
  UserPlus,
  UserMinus,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Post } from "@shared/schema";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  coverPhoto: string | null;
  bio: string | null;
  rating: number | null;
  coins: number | null;
  isVerified: boolean | null;
  status: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
}

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/profile/:id");
  const userId = params?.id || currentUser?.id;

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: userPosts } = useQuery<Post[]>({
    queryKey: ["/api/users", userId, "posts"],
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (profile?.isFollowing) {
        await apiRequest("DELETE", `/api/follow/${userId}`);
      } else {
        await apiRequest("POST", `/api/follow/${userId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    },
  });

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="pb-20" data-testid="page-profile">
        <Skeleton className="h-32 w-full" />
        <div className="px-4 -mt-10 space-y-3">
          <Skeleton className="w-20 h-20 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground" data-testid="page-profile">
        User not found
      </div>
    );
  }

  return (
    <div className="pb-20" data-testid="page-profile">
      <div className="relative">
        <div
          className="h-32 w-full"
          style={{
            background: profile.coverPhoto
              ? `url(${profile.coverPhoto}) center/cover`
              : "linear-gradient(135deg, hsl(270 76% 40%), hsl(200 85% 40%))",
          }}
        />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Button size="icon" variant="ghost" className="bg-black/30 text-white" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {isOwnProfile && (
            <Button size="icon" variant="ghost" className="bg-black/30 text-white" data-testid="button-settings">
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end justify-between gap-3 mb-3">
          <Avatar className="w-20 h-20 border-4 border-background">
            <AvatarImage src={profile.avatar || ""} />
            <AvatarFallback className="text-xl">{profile.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 pb-1">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" data-testid="button-edit-profile">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant={profile.isFollowing ? "outline" : "default"}
                  size="sm"
                  disabled={followMutation.isPending}
                  onClick={() => followMutation.mutate()}
                  data-testid="button-follow"
                >
                  {followMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : profile.isFollowing ? (
                    <><UserMinus className="w-3.5 h-3.5 mr-1" />Unfollow</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5 mr-1" />Follow</>
                  )}
                </Button>
                <Button size="icon" variant="outline" onClick={() => setLocation("/messages")} data-testid="button-message">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold">{profile.displayName}</h2>
            {profile.isVerified && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Star className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
              </div>
            )}
            {(profile.rating || 0) > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                <Star className="w-2.5 h-2.5 mr-0.5 fill-chart-3 text-chart-3" />
                {profile.rating}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm leading-relaxed">{profile.bio}</p>}
        </div>

        <div className="flex items-center gap-6 mb-4">
          <button className="text-center" data-testid="stat-posts">
            <p className="text-sm font-bold">{profile.postsCount}</p>
            <p className="text-[11px] text-muted-foreground">Posts</p>
          </button>
          <button className="text-center" data-testid="stat-followers">
            <p className="text-sm font-bold">{profile.followersCount}</p>
            <p className="text-[11px] text-muted-foreground">Followers</p>
          </button>
          <button className="text-center" data-testid="stat-following">
            <p className="text-sm font-bold">{profile.followingCount}</p>
            <p className="text-[11px] text-muted-foreground">Following</p>
          </button>
          <div className="text-center">
            <p className="text-sm font-bold">{profile.coins?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-muted-foreground">Coins</p>
          </div>
        </div>

        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1" data-testid="tab-profile-posts">
              <Grid3X3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex-1" data-testid="tab-profile-likes">
              <Heart className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex-1" data-testid="tab-profile-saved">
              <Bookmark className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-3">
            {userPosts && userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {userPosts.map((post) => (
                  <button
                    key={post.id}
                    className="aspect-square bg-muted rounded-md overflow-hidden"
                    onClick={() => setLocation(`/post/${post.id}`)}
                    data-testid={`profile-post-${post.id}`}
                  >
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2">
                        <p className="text-[10px] text-muted-foreground text-center line-clamp-3">{post.content}</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No posts yet
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-3">
            <div className="text-center py-12 text-muted-foreground text-sm">
              Liked posts will appear here
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-3">
            <div className="text-center py-12 text-muted-foreground text-sm">
              Saved posts will appear here
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
