import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type StatusType = "online" | "away" | "offline" | string | null | undefined;

interface StatusAvatarProps {
  src?: string | null;
  fallback: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: StatusType;
  isOnline?: boolean | null;
  lastSeen?: string | Date | null;
  showStatus?: boolean;
  hasStory?: boolean;
  storyViewed?: boolean;
  onClick?: () => void;
  className?: string;
  "data-testid"?: string;
}

const sizeMap = {
  xs: { avatar: "w-7 h-7", dot: "w-2 h-2", ring: 1.5, text: "text-[10px]" },
  sm: { avatar: "w-8 h-8", dot: "w-2.5 h-2.5", ring: 2, text: "text-xs" },
  md: { avatar: "w-10 h-10", dot: "w-3 h-3", ring: 2, text: "text-sm" },
  lg: { avatar: "w-14 h-14", dot: "w-3.5 h-3.5", ring: 2.5, text: "text-base" },
  xl: { avatar: "w-20 h-20", dot: "w-4 h-4", ring: 3, text: "text-xl" },
};

function getActivityStatus(status?: StatusType, isOnline?: boolean | null, lastSeen?: string | Date | null): {
  color: string;
  label: string;
} {
  if (isOnline || status === "online") {
    return { color: "bg-green-500", label: "Online" };
  }
  if (status === "away") {
    return { color: "bg-yellow-500", label: "Away" };
  }

  if (lastSeen) {
    const seenDate = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
    const minutesAgo = Math.floor((Date.now() - seenDate.getTime()) / 60000);
    if (minutesAgo < 5) return { color: "bg-green-500", label: "Just now" };
    if (minutesAgo < 60) return { color: "bg-yellow-500", label: `${minutesAgo}m ago` };
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return { color: "bg-muted-foreground/40", label: `${hoursAgo}h ago` };
    return { color: "bg-muted-foreground/40", label: `${Math.floor(hoursAgo / 24)}d ago` };
  }

  return { color: "bg-muted-foreground/40", label: "Offline" };
}

export function formatLastSeen(lastSeen?: string | Date | null, isOnline?: boolean | null): string {
  if (isOnline) return "Online now";
  if (!lastSeen) return "Offline";
  const seenDate = typeof lastSeen === "string" ? new Date(lastSeen) : lastSeen;
  const minutesAgo = Math.floor((Date.now() - seenDate.getTime()) / 60000);
  if (minutesAgo < 1) return "Online now";
  if (minutesAgo < 60) return `Active ${minutesAgo}m ago`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `Active ${hoursAgo}h ago`;
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) return `Active ${daysAgo}d ago`;
  return "Offline";
}

export function StatusAvatar({
  src,
  fallback,
  size = "md",
  status,
  isOnline,
  lastSeen,
  showStatus = true,
  hasStory = false,
  storyViewed = false,
  onClick,
  className = "",
  "data-testid": testId,
}: StatusAvatarProps) {
  const s = sizeMap[size];
  const activity = getActivityStatus(status, isOnline, lastSeen);

  const storyRingStyle = hasStory
    ? storyViewed
      ? "border-muted-foreground/30"
      : ""
    : "";

  const storyGradientActive = hasStory && !storyViewed;

  const avatarContent = (
    <div className={`relative inline-flex ${className}`} data-testid={testId}>
      {storyGradientActive ? (
        <div
          className="rounded-full p-[2.5px]"
          style={{
            background: "linear-gradient(135deg, hsl(45 100% 55%), hsl(350 90% 55%), hsl(280 80% 55%))",
          }}
        >
          <div className="rounded-full bg-background p-[2px]">
            <Avatar className={s.avatar}>
              <AvatarImage src={src || ""} alt={fallback} />
              <AvatarFallback className={s.text}>
                {fallback[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      ) : hasStory ? (
        <div className={`rounded-full p-[2.5px] border-2 ${storyRingStyle}`}>
          <Avatar className={s.avatar}>
            <AvatarImage src={src || ""} alt={fallback} />
            <AvatarFallback className={s.text}>
              {fallback[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <Avatar className={s.avatar}>
          <AvatarImage src={src || ""} alt={fallback} />
          <AvatarFallback className={s.text}>
            {fallback[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      {showStatus && (
        <div
          className={`absolute bottom-0 right-0 ${s.dot} rounded-full ${activity.color} border-2 border-background`}
          title={activity.label}
        />
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="relative" type="button">
        {avatarContent}
      </button>
    );
  }

  return avatarContent;
}
