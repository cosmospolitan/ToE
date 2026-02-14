import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusAvatar, formatLastSeen } from "@/components/status-avatar";
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Eye,
  Palette,
  HelpCircle,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  Globe,
  Moon,
  Sun,
  Star,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";

function useThemeAdapter() {
  const { theme, toggleTheme } = useTheme();
  return { theme, setTheme: (_: string) => toggleTheme() };
}

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Edit Profile", desc: "Name, bio, avatar", path: null },
      { icon: Lock, label: "Password & Security", desc: "Change password, 2FA", path: null },
      { icon: Eye, label: "Privacy", desc: "Who can see your content", path: null },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", desc: "Push, email, in-app", path: "/notifications" },
      { icon: Globe, label: "Language", desc: "English", path: null },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: Shield, label: "Blocked Accounts", desc: "Manage blocked users", path: null },
      { icon: Lock, label: "Login Activity", desc: "Where you're logged in", path: null },
    ],
  },
  {
    title: "About",
    items: [
      { icon: HelpCircle, label: "Help & Support", desc: "FAQ, contact us", path: null },
      { icon: Info, label: "About SuperApp", desc: "Version 1.0.0", path: null },
    ],
  },
];

export default function Settings() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme, setTheme } = useThemeAdapter();
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { displayName: string; bio: string }) => {
      const res = await apiRequest("PUT", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditMode(false);
      toast({ title: "Profile Updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", "/api/users/status", { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Status Updated" });
    },
  });

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-settings">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <Card data-testid="profile-card">
          <CardContent className="p-4">
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                  <div className="flex items-center bg-muted rounded-md px-3 py-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                      data-testid="input-display-name"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
                  <div className="flex items-center bg-muted rounded-md px-3 py-2">
                    <input
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Write about yourself..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      data-testid="input-bio"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => updateMutation.mutate({ displayName, bio })}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <StatusAvatar
                  src={user?.avatar}
                  fallback={user?.username || "U"}
                  size="lg"
                  status={user?.status}
                  isOnline={user?.isOnline}
                  lastSeen={user?.lastSeen}
                  showStatus={true}
                  data-testid="settings-avatar"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-base font-semibold truncate">{user?.displayName}</p>
                    {user?.isVerified && (
                      <Star className="w-3.5 h-3.5 fill-chart-3 text-chart-3 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">{formatLastSeen(user?.lastSeen, user?.isOnline)}</p>
                  {user?.bio && <p className="text-xs text-muted-foreground mt-0.5">{user.bio}</p>}
                </div>
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)} data-testid="button-edit-profile">
                  Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="status-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3">Status</h3>
            <div className="flex items-center gap-2">
              {[
                { value: "online", label: "Online", color: "bg-green-500" },
                { value: "away", label: "Away", color: "bg-yellow-500" },
                { value: "offline", label: "Offline", color: "bg-muted-foreground/40" },
              ].map(s => (
                <Button
                  key={s.value}
                  variant={user?.status === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => statusMutation.mutate(s.value)}
                  disabled={statusMutation.isPending}
                  className="flex-1 gap-1.5"
                  data-testid={`status-${s.value}`}
                >
                  <div className={`w-2 h-2 rounded-full ${s.color}`} />
                  {s.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="theme-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Appearance</p>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                data-testid="button-toggle-theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {settingsSections.map(section => (
          <div key={section.title}>
            <h3 className="text-xs text-muted-foreground font-medium px-1 mb-2">{section.title}</h3>
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover-elevate"
                      onClick={() => item.path && setLocation(item.path)}
                      data-testid={`setting-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        <Button
          variant="destructive"
          className="w-full"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
