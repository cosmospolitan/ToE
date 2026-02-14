import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertChatMessageSchema, insertInvestmentSchema, insertPluginSchema, insertGameSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/posts", async (_req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json(posts);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost(data);
      res.json(post);
    } catch (e) {
      res.status(400).json({ error: "Invalid post data" });
    }
  });

  app.get("/api/users/top", async (_req, res) => {
    try {
      const users = await storage.getTopUsers();
      res.json(users);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/chat", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || "demo-user";
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const data = insertChatMessageSchema.parse(req.body);
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
        userId: data.userId,
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

  app.post("/api/posts/unlock", async (req, res) => {
    try {
      const { postId } = req.body;
      if (!postId) {
        return res.status(400).json({ error: "Post ID required" });
      }
      res.json({ success: true, postId });
    } catch (e) {
      res.status(400).json({ error: "Failed to unlock post" });
    }
  });

  return httpServer;
}
