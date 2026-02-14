import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  signupSchema, loginSchema,
  insertPostSchema, insertChatMessageSchema, insertInvestmentSchema,
  insertPluginSchema, insertGameSchema, insertCommentSchema, insertMessageSchema,
} from "@shared/schema";
import bcrypt from "bcryptjs";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        passwordHash,
        displayName: data.displayName,
      });
      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Invalid signup data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      req.session.userId = user.id;
      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (e: any) {
      res.status(400).json({ error: e.message || "Invalid login data" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  app.get("/api/users/top", async (_req, res) => {
    try {
      const userList = await storage.getTopUsers();
      res.json(userList.map(u => { const { passwordHash: _, ...safe } = u; return safe; }));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { passwordHash: _, ...safeUser } = user;
      const followersCount = await storage.getFollowersCount(user.id);
      const followingCount = await storage.getFollowingCount(user.id);
      const posts = await storage.getPostsByUser(user.id);
      let isFollowing = false;
      if (req.session.userId) {
        isFollowing = await storage.isFollowing(req.session.userId, user.id);
      }
      res.json({ ...safeUser, followersCount, followingCount, postsCount: posts.length, isFollowing });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const { displayName, bio, avatar, coverPhoto } = req.body;
      const updated = await storage.updateUser(req.session.userId!, { displayName, bio, avatar, coverPhoto });
      if (!updated) return res.status(404).json({ error: "User not found" });
      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/follow/:userId", requireAuth, async (req, res) => {
    try {
      if (req.session.userId === req.params.userId) {
        return res.status(400).json({ error: "Cannot follow yourself" });
      }
      await storage.follow(req.session.userId!, req.params.userId);
      await storage.createNotification({
        userId: req.params.userId,
        actorId: req.session.userId!,
        type: "follow",
        title: "New follower",
        body: "started following you",
      });
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to follow" });
    }
  });

  app.delete("/api/follow/:userId", requireAuth, async (req, res) => {
    try {
      await storage.unfollow(req.session.userId!, req.params.userId);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to unfollow" });
    }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    try {
      const followers = await storage.getFollowers(req.params.id);
      res.json(followers.map(u => { const { passwordHash: _, ...safe } = u; return safe; }));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  });

  app.get("/api/users/:id/following", async (req, res) => {
    try {
      const following = await storage.getFollowing(req.params.id);
      res.json(following.map(u => { const { passwordHash: _, ...safe } = u; return safe; }));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const userPosts = await storage.getPostsByUser(req.params.id);
      res.json(userPosts);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  });

  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const data = insertPostSchema.parse({ ...req.body, userId: req.session.userId });
      const post = await storage.createPost(data);
      res.json(post);
    } catch (e) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.post("/api/posts/:id/like", requireAuth, async (req, res) => {
    try {
      const existing = await storage.getReaction(req.session.userId!, req.params.id);
      if (existing) {
        await storage.deleteReaction(req.session.userId!, req.params.id);
        await storage.updatePostCounts(req.params.id, "likes", -1);
        res.json({ liked: false });
      } else {
        await storage.createReaction({ userId: req.session.userId!, postId: req.params.id, type: "like" });
        await storage.updatePostCounts(req.params.id, "likes", 1);
        const post = await storage.getPostById(req.params.id);
        if (post && post.userId !== req.session.userId) {
          await storage.createNotification({
            userId: post.userId,
            actorId: req.session.userId!,
            type: "like",
            title: "Post liked",
            body: "liked your post",
            referenceId: req.params.id,
            referenceType: "post",
          });
        }
        res.json({ liked: true });
      }
    } catch (e) {
      res.status(400).json({ error: "Failed to toggle like" });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postComments = await storage.getCommentsByPost(req.params.id);
      res.json(postComments);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/posts/:id/comments", requireAuth, async (req, res) => {
    try {
      const data = insertCommentSchema.parse({
        postId: req.params.id,
        userId: req.session.userId,
        content: req.body.content,
        parentId: req.body.parentId || null,
      });
      const comment = await storage.createComment(data);
      await storage.updatePostCounts(req.params.id, "comments", 1);
      const post = await storage.getPostById(req.params.id);
      if (post && post.userId !== req.session.userId) {
        await storage.createNotification({
          userId: post.userId,
          actorId: req.session.userId!,
          type: "comment",
          title: "New comment",
          body: req.body.content.slice(0, 100),
          referenceId: req.params.id,
          referenceType: "post",
        });
      }
      res.json(comment);
    } catch (e) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.get("/api/conversations", requireAuth, async (req, res) => {
    try {
      const convs = await storage.getConversations(req.session.userId!);
      res.json(convs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", requireAuth, async (req, res) => {
    try {
      const { recipientId } = req.body;
      if (!recipientId) return res.status(400).json({ error: "Recipient required" });
      const conv = await storage.getOrCreateConversation([req.session.userId!, recipientId]);
      res.json(conv);
    } catch (e) {
      res.status(400).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const msgs = await storage.getMessages(req.params.id);
      await storage.markMessagesRead(req.params.id, req.session.userId!);
      res.json(msgs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", requireAuth, async (req, res) => {
    try {
      const data = insertMessageSchema.parse({
        conversationId: req.params.id,
        senderId: req.session.userId,
        content: req.body.content,
      });
      const msg = await storage.createMessage(data);
      res.json(msg);
    } catch (e) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifs = await storage.getNotifications(req.session.userId!);
      res.json(notifs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationsRead(req.session.userId!);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to mark notifications read" });
    }
  });

  app.get("/api/notifications/count", requireAuth, async (req, res) => {
    try {
      const cnt = await storage.getUnreadNotificationCount(req.session.userId!);
      res.json({ count: cnt });
    } catch (e) {
      res.status(500).json({ error: "Failed to get count" });
    }
  });

  app.get("/api/search/users", async (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      if (!q.trim()) return res.json([]);
      const results = await storage.searchUsers(q);
      res.json(results.map(u => { const { passwordHash: _, ...safe } = u; return safe; }));
    } catch (e) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/chat", async (req, res) => {
    try {
      const userId = req.session.userId || (req.query.userId as string) || "demo-user";
      const msgs = await storage.getChatMessages(userId);
      res.json(msgs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const userId = req.session.userId || "demo-user";
      const data = insertChatMessageSchema.parse({ ...req.body, userId });
      const userMsg = await storage.createChatMessage(data);

      const aiResponses: Record<string, string> = {
        "Generate a business plan": "I'd be happy to help you create a business plan! Let's start with your core idea. What product or service would you like to build? I'll help you outline the market opportunity, revenue model, and growth strategy.",
        "Find trending plugins": "Here are the top trending plugins right now:\n\n1. CryptoPool - Liquidity pooling (12.4K downloads)\n2. MAGA - Market Analytics (15.6K downloads)\n3. CopyX - Copy Trading (8.9K downloads)\n\nWould you like details on any of these?",
        "Analyze my investments": "Let me analyze your portfolio:\n\nTotal Value: 15,290 coins\nTotal Return: +22.8%\nBest Performer: CryptoPool Plugin (+35%)\n\nYour portfolio is well-diversified across users and plugins. Consider increasing allocation to high-rating users for stable returns.",
        "Create a workspace": "I'll help you set up a new workspace! The plugin editor supports:\n\n- Visual node-based workflows\n- Custom triggers and actions\n- API integrations\n- Automated testing\n\nShall I guide you through creating your first plugin?",
      };

      const responseContent = aiResponses[data.content] ||
        `I understand you're asking about "${data.content}". That's a great question! Let me help you with that. Based on the current market trends and your profile, I'd recommend exploring our marketplace for relevant tools and connecting with top-rated users in this space. Would you like me to provide more specific recommendations?`;

      const aiMsg = await storage.createChatMessage({
        userId,
        role: "assistant",
        content: responseContent,
      });

      res.json({ userMessage: userMsg, aiMessage: aiMsg });
    } catch (e) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/investments", async (_req, res) => {
    try {
      const invs = await storage.getInvestments();
      res.json(invs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const data = insertInvestmentSchema.parse(req.body);
      const inv = await storage.createInvestment(data);
      res.json(inv);
    } catch (e) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  app.get("/api/plugins", async (_req, res) => {
    try {
      const pluginList = await storage.getPlugins();
      res.json(pluginList);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch plugins" });
    }
  });

  app.post("/api/plugins", async (req, res) => {
    try {
      const data = insertPluginSchema.parse(req.body);
      const plugin = await storage.createPlugin(data);
      res.json(plugin);
    } catch (e) {
      res.status(400).json({ error: "Invalid plugin data" });
    }
  });

  app.get("/api/games", async (_req, res) => {
    try {
      const gameList = await storage.getGames();
      res.json(gameList);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const data = insertGameSchema.parse(req.body);
      const game = await storage.createGame(data);
      res.json(game);
    } catch (e) {
      res.status(400).json({ error: "Invalid game data" });
    }
  });

  return httpServer;
}
