import { useLocation } from "wouter";
import { Home, Brain, TrendingUp, Puzzle, Gamepad2 } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Feed" },
  { path: "/ai", icon: Brain, label: "AI" },
  { path: "/invest", icon: TrendingUp, label: "Invest" },
  { path: "/workspace", icon: Puzzle, label: "Workspace" },
  { path: "/gaming", icon: Gamepad2, label: "Games" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 dark:bg-background/90"
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-8 rounded-md transition-all ${
                  isActive
                    ? "bg-primary/15 dark:bg-primary/20"
                    : ""
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
