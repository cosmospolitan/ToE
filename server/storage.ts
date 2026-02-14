import {
  type User, type InsertUser,
  type Post, type InsertPost,
  type ChatMessage, type InsertChatMessage,
  type Investment, type InsertInvestment,
  type Plugin, type InsertPlugin,
  type Game, type InsertGame,
  users, posts, chatMessages, investments, plugins, games,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getTopUsers(): Promise<User[]>;

  getPosts(): Promise<(Post & { author: User })[]>;
  createPost(post: InsertPost): Promise<Post>;

  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;

  getInvestments(): Promise<Investment[]>;
  createInvestment(inv: InsertInvestment): Promise<Investment>;

  getPlugins(): Promise<Plugin[]>;
  createPlugin(plugin: InsertPlugin): Promise<Plugin>;

  getGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getTopUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.rating)).limit(10);
  }

  async getPosts(): Promise<(Post & { author: User })[]> {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    const result: (Post & { author: User })[] = [];
    for (const post of allPosts) {
      const [author] = await db.select().from(users).where(eq(users.id, post.userId));
      if (author) {
        result.push({ ...post, author });
      }
    }
    return result;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async getChatMessages(userId: string): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt);
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(msg).returning();
    return created;
  }

  async getInvestments(): Promise<Investment[]> {
    return db.select().from(investments).orderBy(desc(investments.createdAt));
  }

  async createInvestment(inv: InsertInvestment): Promise<Investment> {
    const [created] = await db.insert(investments).values(inv).returning();
    return created;
  }

  async getPlugins(): Promise<Plugin[]> {
    return db.select().from(plugins).orderBy(desc(plugins.downloads));
  }

  async createPlugin(plugin: InsertPlugin): Promise<Plugin> {
    const [created] = await db.insert(plugins).values(plugin).returning();
    return created;
  }

  async getGames(): Promise<Game[]> {
    return db.select().from(games).orderBy(desc(games.players));
  }

  async createGame(game: InsertGame): Promise<Game> {
    const [created] = await db.insert(games).values(game).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
