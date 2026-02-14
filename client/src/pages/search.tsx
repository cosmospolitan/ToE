import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search as SearchIcon,
  Star,
  X,
} from "lucide-react";
import { useLocation } from "wouter";

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean | null;
  rating: number | null;
}

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");

  const { data: results, isLoading } = useQuery<SearchUser[]>({
    queryKey: ["/api/search/users", `?q=${encodeURIComponent(query)}`],
    enabled: query.trim().length >= 2,
  });

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-search">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
            <SearchIcon className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              data-testid="input-search"
            />
            {query && (
              <button onClick={() => setQuery("")} data-testid="button-clear-search">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 space-y-2">
        {query.trim().length < 2 ? (
          <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Search for users by name or username</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Searching...</div>
        ) : results && results.length > 0 ? (
          results.map((u) => (
            <button
              key={u.id}
              className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate text-left"
              onClick={() => setLocation(`/profile/${u.id}`)}
              data-testid={`search-result-${u.id}`}
            >
              <Avatar className="w-11 h-11">
                <AvatarImage src={u.avatar || ""} />
                <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold truncate">{u.displayName}</p>
                  {u.isVerified && (
                    <Star className="w-3 h-3 fill-primary text-primary shrink-0" />
                  )}
                  {(u.rating || 0) > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {u.rating}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
                {u.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{u.bio}</p>}
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No users found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
