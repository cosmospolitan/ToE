import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  signupSchema, loginSchema,
  insertPostSchema, insertChatMessageSchema, insertInvestmentSchema,
  insertPluginSchema, insertGameSchema, insertCommentSchema, insertMessageSchema,
  insertTournamentSchema, insertGiftSchema,
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

  app.get("/api/chat", requireAuth, async (req, res) => {
    try {
      const msgs = await storage.getChatMessages(req.session.userId!);
      res.json(msgs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      const data = insertChatMessageSchema.parse({ ...req.body, userId });
      const userMsg = await storage.createChatMessage(data);

      const userInvestments = await storage.getInvestmentsByUser(userId);
      const totalInvested = userInvestments.reduce((s, i) => s + i.amount, 0);
      const avgReturn = userInvestments.length > 0 ? (userInvestments.reduce((s, i) => s + (i.returnRate || 0), 0) / userInvestments.length).toFixed(1) : "0";

      const aiResponses: Record<string, string> = {
        "Generate a business plan": `Great idea, ${user?.displayName || "there"}! Let's build your business plan:\n\n1. Define your core product/service\n2. Identify target market and competitors\n3. Revenue model (subscriptions, coins, or marketplace fees)\n4. Growth strategy using SuperApp's 50K+ user base\n5. Financial projections\n\nWhat's your product idea? I'll help you flesh it out with market data.`,
        "Find trending plugins": "Here are today's trending plugins:\n\n1. CryptoPool - Liquidity pooling (12.4K downloads, +35% ROI)\n2. MAGA - Market Analytics & Governance (15.6K downloads)\n3. CopyX - Social Copy Trading (8.9K downloads)\n4. UniNations - Decentralized Governance (6.2K downloads)\n\nYour portfolio would benefit most from CryptoPool based on your current allocation. Want me to analyze the investment potential?",
        "Analyze my investments": `Here's your portfolio analysis, ${user?.displayName || "there"}:\n\nActive Investments: ${userInvestments.length}\nTotal Invested: ${totalInvested.toLocaleString()} coins\nAverage Return: ${avgReturn}%\nCoin Balance: ${user?.coins?.toLocaleString() || 0}\n\n${userInvestments.length > 0 ? userInvestments.map(i => `- ${i.targetName}: ${i.amount} coins (${(i.returnRate || 0) >= 0 ? '+' : ''}${i.returnRate}%)`).join('\n') : 'No active investments yet.'}\n\nRecommendation: Consider diversifying across both users and plugins for optimal risk-adjusted returns.`,
        "Create a workspace": `Let's set up your workspace, ${user?.displayName || "there"}! The plugin builder supports:\n\n- Visual node-based workflow editor\n- Custom triggers (webhook, schedule, event-based)\n- Processing nodes (code, AI, data transform)\n- Output actions (API call, notification, trade)\n\nYou already have access to the Plugin Editor in the Workspace tab. Try connecting a Trigger node to a Process node to start building your first automation.`,
      };

      const lc = data.content.toLowerCase();
      let responseContent = aiResponses[data.content];
      if (!responseContent) {
        if (lc.includes("invest") || lc.includes("portfolio")) {
          responseContent = `Based on your profile (${user?.coins?.toLocaleString() || 0} coins, ${userInvestments.length} active investments), here's my advice:\n\nYour current return rate averages ${avgReturn}%. ${Number(avgReturn) > 10 ? "That's strong performance!" : "Consider rebalancing for better returns."}\n\nTop opportunities right now:\n- High-rated users (45+ rating) for stable 15-25% returns\n- CryptoPool plugin for higher-risk 30%+ potential\n\nWould you like me to suggest specific investment amounts?`;
        } else if (lc.includes("game") || lc.includes("tournament")) {
          responseContent = `Check out the Gaming section for active tournaments! You can earn prizes by competing.\n\nTips for maximizing earnings:\n- Join tournaments with lower entry fees to start\n- Practice in free games first\n- Compete in tournaments matching your skill level\n\nYour current balance of ${user?.coins?.toLocaleString() || 0} coins gives you plenty of entry opportunities.`;
        } else if (lc.includes("plugin") || lc.includes("workspace") || lc.includes("build")) {
          responseContent = `I can help you with plugins and workspace tools!\n\nYour options:\n1. Browse the Marketplace for 100+ ready-to-use plugins\n2. Build your own using the visual Plugin Editor\n3. Invest in trending plugins for passive returns\n\nPopular categories: Finance, Analytics, Social, Automation\n\nWant me to recommend plugins based on your interests?`;
        } else {
          responseContent = `Thanks for your question, ${user?.displayName || "there"}! I can help you with:\n\n- Investment analysis and portfolio recommendations\n- Plugin discovery and workspace setup\n- Tournament strategy and gaming tips\n- Business planning and growth strategies\n- Social features and networking\n\nYour account: ${user?.coins?.toLocaleString() || 0} coins | ${userInvestments.length} investments | Rating: ${user?.rating || 0}\n\nWhat would you like to explore?`;
        }
      }

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

  app.get("/api/investments", requireAuth, async (req, res) => {
    try {
      const invs = await storage.getInvestmentsByUser(req.session.userId!);
      res.json(invs);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });
      const { targetType, targetId, targetName, amount } = req.body;
      if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
      if ((user.coins || 0) < amount) return res.status(400).json({ error: "Insufficient coins" });

      await storage.updateUserCoins(req.session.userId!, -amount);
      const returnRate = Math.floor(Math.random() * 40) - 5;
      const inv = await storage.createInvestment({
        investorId: req.session.userId!,
        targetType,
        targetId,
        targetName,
        amount,
        returnRate,
        status: "active",
      });
      res.json(inv);
    } catch (e) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  app.post("/api/investments/:id/withdraw", requireAuth, async (req, res) => {
    try {
      const invs = await storage.getInvestmentsByUser(req.session.userId!);
      const inv = invs.find(i => i.id === req.params.id);
      if (!inv) return res.status(404).json({ error: "Investment not found" });
      const returnAmount = Math.floor(inv.amount * (1 + (inv.returnRate || 0) / 100));
      await storage.updateUserCoins(req.session.userId!, returnAmount);
      res.json({ withdrawn: returnAmount });
    } catch (e) {
      res.status(400).json({ error: "Failed to withdraw" });
    }
  });

  app.get("/api/user/reactions", requireAuth, async (req, res) => {
    try {
      const postIds = await storage.getUserReactions(req.session.userId!);
      res.json(postIds);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  app.get("/api/stories", requireAuth, async (req, res) => {
    try {
      const followedUsers = await storage.getFollowedUsers(req.session.userId!);
      const allUsers = await storage.getTopUsers();
      const storyUsers = followedUsers.length > 0 ? followedUsers : allUsers.slice(0, 6);
      res.json(storyUsers.map(u => { const { passwordHash: _, ...safe } = u; return safe; }));
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch stories" });
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

  app.get("/api/tournaments", async (_req, res) => {
    try {
      const tournamentList = await storage.getTournaments();
      res.json(tournamentList);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const t = await storage.getTournament(req.params.id);
      if (!t) return res.status(404).json({ error: "Tournament not found" });
      const entries = await storage.getTournamentEntries(req.params.id);
      let joined = false;
      if (req.session.userId) {
        const entry = await storage.getUserTournamentEntry(req.params.id, req.session.userId);
        joined = !!entry;
      }
      res.json({ ...t, entries, joined });
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  app.post("/api/tournaments/:id/join", requireAuth, async (req, res) => {
    try {
      const t = await storage.getTournament(req.params.id);
      if (!t) return res.status(404).json({ error: "Tournament not found" });
      const existing = await storage.getUserTournamentEntry(req.params.id, req.session.userId!);
      if (existing) return res.status(400).json({ error: "Already joined" });
      if ((t.currentPlayers || 0) >= (t.maxPlayers || 100)) return res.status(400).json({ error: "Tournament is full" });
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(404).json({ error: "User not found" });
      const fee = t.entryFee || 0;
      if (fee > 0 && (user.coins || 0) < fee) return res.status(400).json({ error: "Insufficient coins for entry fee" });
      const entry = await storage.joinTournament(req.params.id, req.session.userId!, fee);
      await storage.createNotification({
        userId: req.session.userId!,
        type: "tournament",
        title: "Tournament Joined",
        body: `You joined "${t.title}" tournament`,
      });
      res.json(entry);
    } catch (e) {
      res.status(400).json({ error: "Failed to join tournament" });
    }
  });

  app.post("/api/tournaments/:id/leave", requireAuth, async (req, res) => {
    try {
      await storage.leaveTournament(req.params.id, req.session.userId!);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "Failed to leave tournament" });
    }
  });

  app.get("/api/tournaments/:id/leaderboard", async (req, res) => {
    try {
      const entries = await storage.getTournamentEntries(req.params.id);
      res.json(entries);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/gifts", requireAuth, async (req, res) => {
    try {
      const sender = await storage.getUser(req.session.userId!);
      if (!sender) return res.status(404).json({ error: "User not found" });
      const { receiverId, postId, giftType, amount, message } = req.body;
      if (!receiverId || typeof receiverId !== "string") return res.status(400).json({ error: "Receiver required" });
      if (!amount || typeof amount !== "number" || amount <= 0 || !Number.isInteger(amount)) return res.status(400).json({ error: "Invalid amount" });
      if ((sender.coins || 0) < amount) return res.status(400).json({ error: "Insufficient coins" });
      if (receiverId === req.session.userId) return res.status(400).json({ error: "Cannot gift yourself" });
      const receiver = await storage.getUser(receiverId);
      if (!receiver) return res.status(404).json({ error: "Receiver not found" });

      await storage.updateUserCoins(req.session.userId!, -amount);
      await storage.updateUserCoins(receiverId, amount);

      const gift = await storage.createGift({
        senderId: req.session.userId!,
        receiverId,
        postId: postId || null,
        giftType: giftType || "coin",
        amount,
        message: message || null,
      });

      await storage.createTransaction({
        userId: req.session.userId!,
        type: "gift_sent",
        amount: -amount,
        description: `Gift sent`,
        referenceId: gift.id,
        referenceType: "gift",
      });
      await storage.createTransaction({
        userId: receiverId,
        type: "gift_received",
        amount,
        description: `Gift received`,
        referenceId: gift.id,
        referenceType: "gift",
      });

      await storage.createNotification({
        userId: receiverId,
        actorId: req.session.userId!,
        type: "gift",
        title: "Gift received!",
        body: `sent you ${amount} coins`,
        referenceId: postId || undefined,
        referenceType: postId ? "post" : undefined,
      });

      res.json(gift);
    } catch (e) {
      res.status(400).json({ error: "Failed to send gift" });
    }
  });

  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const txns = await storage.getTransactions(req.session.userId!);
      res.json(txns);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/messages/unread-count", requireAuth, async (req, res) => {
    try {
      const cnt = await storage.getUnreadMessageCount(req.session.userId!);
      res.json({ count: cnt });
    } catch (e) {
      res.status(500).json({ error: "Failed to get count" });
    }
  });

  app.put("/api/users/status", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["online", "away", "offline"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateUser(req.session.userId!, { status } as any);
      if (!updated) return res.status(404).json({ error: "User not found" });
      const { passwordHash: _, ...safeUser } = updated;
      res.json(safeUser);
    } catch (e) {
      res.status(400).json({ error: "Failed to update status" });
    }
  });

  return httpServer;
}
