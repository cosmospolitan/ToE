import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Hourglass,
  Store,
  Wrench,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { ChatMessage } from "@shared/schema";

const aiTools = [
  { icon: Brain, label: "Brain", color: "text-primary" },
  { icon: Hourglass, label: "Schedule", color: "text-chart-3" },
  { icon: Store, label: "Marketplace", color: "text-chart-2" },
  { icon: Wrench, label: "Services", color: "text-chart-4" },
];

export default function AiChat() {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState("Brain");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat"],
    enabled: !!user,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        content,
        role: "user",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMutation.mutate(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full" data-testid="page-ai-chat">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(270 76% 52%), hsl(200 85% 50%))" }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold">AI Assistant</h1>
            <p className="text-[11px] text-muted-foreground">Powered by intelligence</p>
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-44">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <Skeleton className="h-16 flex-1 rounded-md" />
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                data-testid={`chat-message-${msg.id}`}
              >
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback
                    className={msg.role === "assistant"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted"}
                  >
                    {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-md text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMutation.isPending && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary/15 text-primary">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border px-4 py-3 rounded-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg, hsl(270 76% 52% / 0.15), hsl(200 85% 50% / 0.15))" }}
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {user ? `Hi ${user.displayName}!` : "How can I help you?"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Ask me anything about investments, plugins, games, or get personalized recommendations.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-[320px]">
              {["Generate a business plan", "Find trending plugins", "Analyze my investments", "Create a workspace"].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-left text-xs p-3 rounded-md border border-border bg-card hover-elevate transition-all"
                  data-testid={`suggestion-${s.slice(0, 10)}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-2 px-4 py-2">
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.label;
            return (
              <button
                key={tool.label}
                onClick={() => setActiveTool(tool.label)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-all ${
                  isActive ? "bg-primary/10" : ""
                }`}
                data-testid={`ai-tool-${tool.label.toLowerCase()}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tool.color : "text-muted-foreground"}`} />
                <span className={`text-[9px] font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              data-testid="input-ai-chat"
            />
          </div>
          <Button
            size="icon"
            disabled={!input.trim() || sendMutation.isPending}
            onClick={handleSend}
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
