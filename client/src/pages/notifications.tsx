import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusAvatar } from "@/components/status-avatar";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  UserPlus,
  Bell,
  Check,
  Gift,
  Coins,
  Trophy,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Notification, User } from "@shared/schema";

type NotifWithActor = Notification & { actor?: User };

const notifIcons: Record<string, typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  gift: Gift,
  coin: Coins,
  tournament: Trophy,
};

const notifColors: Record<string, string> = {
  like: "bg-destructive",
  comment: "bg-chart-2",
  follow: "bg-primary",
  gift: "bg-chart-4",
  coin: "bg-chart-3",
  tournament: "bg-chart-1",
};

export default function Notifications() {
  const [, setLocation] = useLocation();

  const { data: notifications, isLoading } = useQuery<NotifWithActor[]>({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    },
  });

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-notifications">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between gap-2 px-4 h-14">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base font-semibold">Notifications</h1>
          </div>
          {notifications && notifications.some(n => !n.isRead) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markReadMutation.mutate()}
              data-testid="button-mark-read"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </header>

      <div className="p-4 space-y-1">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))
        ) : notifications && notifications.length > 0 ? (
          notifications.map((notif) => {
            const Icon = notifIcons[notif.type] || Bell;
            return (
              <button
                key={notif.id}
                className={`w-full flex items-center gap-3 py-3 px-2 rounded-md text-left transition-colors ${
                  !notif.isRead ? "bg-primary/5" : ""
                }`}
                onClick={() => {
                  if (notif.referenceType === "post" && notif.referenceId) {
                    setLocation(`/post/${notif.referenceId}`);
                  } else if (notif.actorId) {
                    setLocation(`/profile/${notif.actorId}`);
                  }
                }}
                data-testid={`notification-${notif.id}`}
              >
                <div className="relative">
                  <StatusAvatar
                    src={notif.actor?.avatar}
                    fallback={notif.actor?.username || "?"}
                    size="md"
                    status={notif.actor?.status}
                    isOnline={notif.actor?.isOnline}
                    lastSeen={notif.actor?.lastSeen}
                    showStatus={true}
                    data-testid={`notif-avatar-${notif.id}`}
                  />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${notifColors[notif.type] || "bg-primary"} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{notif.actor?.displayName || "Someone"}</span>
                    {" "}
                    <span className="text-muted-foreground">{notif.body}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
