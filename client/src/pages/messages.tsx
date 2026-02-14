import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusAvatar, formatLastSeen } from "@/components/status-avatar";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Loader2,
  Search,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Conversation, Message, User } from "@shared/schema";

type ConversationWithDetails = Conversation & { members: User[]; lastMessage?: Message };
type MessageWithSender = Message & { sender: User };

export default function Messages() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [msgText, setMsgText] = useState("");

  const { data: conversations, isLoading: convsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: activeMessages } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/conversations", activeConvId, "messages"],
    enabled: !!activeConvId,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/conversations/${activeConvId}/messages`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", activeConvId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMsgText("");
    },
  });

  const activeConv = conversations?.find(c => c.id === activeConvId);
  const otherUser = activeConv?.members.find(m => m.id !== user?.id);

  if (activeConvId && activeConv) {
    return (
      <div className="flex flex-col h-full" data-testid="page-conversation">
        <header
          className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90 flex items-center gap-3 px-4 h-14"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <Button size="icon" variant="ghost" onClick={() => setActiveConvId(null)} data-testid="button-back-messages">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <StatusAvatar
            src={otherUser?.avatar}
            fallback={otherUser?.username || "?"}
            size="sm"
            status={otherUser?.status}
            isOnline={otherUser?.isOnline}
            lastSeen={otherUser?.lastSeen}
            showStatus={true}
            data-testid="chat-avatar"
          />
          <div>
            <p className="text-sm font-semibold">{otherUser?.displayName || "Chat"}</p>
            <p className="text-[10px] text-muted-foreground">{formatLastSeen(otherUser?.lastSeen, otherUser?.isOnline)}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-44 space-y-3">
          {activeMessages?.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`} data-testid={`msg-${msg.id}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-md text-sm ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 px-4 py-3"
          style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        >
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="flex-1 flex items-center bg-muted rounded-md px-3 py-2">
              <input
                type="text"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && msgText.trim() && sendMutation.mutate(msgText.trim())}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                data-testid="input-message"
              />
            </div>
            <Button
              size="icon"
              disabled={!msgText.trim() || sendMutation.isPending}
              onClick={() => sendMutation.mutate(msgText.trim())}
              data-testid="button-send-message"
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-20" data-testid="page-messages">
      <header
        className="sticky top-0 z-40 border-b border-border bg-background/80 dark:bg-background/90"
        style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center gap-3 px-4 h-14">
          <Button size="icon" variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base font-semibold">Messages</h1>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {convsLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : conversations && conversations.length > 0 ? (
          conversations.map((conv) => {
            const other = conv.members.find(m => m.id !== user?.id);
            return (
              <button
                key={conv.id}
                className="w-full flex items-center gap-3 p-3 rounded-md hover-elevate text-left"
                onClick={() => setActiveConvId(conv.id)}
                data-testid={`conversation-${conv.id}`}
              >
                <StatusAvatar
                  src={other?.avatar}
                  fallback={other?.username || "?"}
                  size="md"
                  status={other?.status}
                  isOnline={other?.isOnline}
                  lastSeen={other?.lastSeen}
                  showStatus={true}
                  data-testid={`conv-avatar-${conv.id}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{other?.displayName || "Chat"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage?.content || "No messages yet"}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {formatLastSeen(other?.lastSeen, other?.isOnline)}
                </span>
              </button>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Start a conversation from a user's profile</p>
          </div>
        )}
      </div>
    </div>
  );
}
