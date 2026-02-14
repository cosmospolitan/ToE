import {
  type User, type InsertUser,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type Reaction, type InsertReaction,
  type Follow, type InsertFollow,
  type Conversation, type InsertConversation,
  type ConversationMember, type InsertConversationMember,
  type Message, type InsertMessage,
  type Notification, type InsertNotification,
  type ChatMessage, type InsertChatMessage,
  type Investment, type InsertInvestment,
  type Plugin, type InsertPlugin,
  type Game, type InsertGame,
  type Tournament, type InsertTournament,
  type TournamentEntry, type InsertTournamentEntry,
  type Gift, type InsertGift,
  type Transaction, type InsertTransaction,
  users, posts, comments, reactions, follows,
  conversations, conversationMembers, messages,
  notifications, chatMessages, investments, plugins, games,
  tournaments, tournamentEntries, gifts, transactions,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, ilike, count } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  getTopUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;

  getPosts(): Promise<(Post & { author: User })[]>;
  getPostById(id: string): Promise<(Post & { author: User }) | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePostCounts(id: string, field: "likes" | "comments" | "reposts", delta: number): Promise<void>;

  getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  createReaction(reaction: InsertReaction): Promise<Reaction>;
  deleteReaction(userId: string, postId?: string, commentId?: string): Promise<void>;
  getReaction(userId: string, postId?: string, commentId?: string): Promise<Reaction | undefined>;

  follow(followerId: string, followingId: string): Promise<Follow>;
  unfollow(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  getFollowersCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  getConversations(userId: string): Promise<(Conversation & { members: User[]; lastMessage?: Message })[]>;
  getOrCreateConversation(userIds: string[]): Promise<Conversation>;
  getMessages(conversationId: string): Promise<(Message & { sender: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesRead(conversationId: string, userId: string): Promise<void>;

  getNotifications(userId: string): Promise<(Notification & { actor?: User })[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  getChatMessages(userId: string): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;

  getInvestments(): Promise<Investment[]>;
  createInvestment(inv: InsertInvestment): Promise<Investment>;

  getPlugins(): Promise<Plugin[]>;
  createPlugin(plugin: InsertPlugin): Promise<Plugin>;

  getGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;

  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  joinTournament(tournamentId: string, userId: string, entryFee: number): Promise<TournamentEntry>;
  leaveTournament(tournamentId: string, userId: string): Promise<void>;
  getTournamentEntries(tournamentId: string): Promise<(TournamentEntry & { user: User })[]>;
  getUserTournamentEntry(tournamentId: string, userId: string): Promise<TournamentEntry | undefined>;
  updateTournamentScore(tournamentId: string, userId: string, score: number): Promise<void>;

  getInvestmentsByUser(userId: string): Promise<Investment[]>;
  updateUserCoins(userId: string, delta: number): Promise<User | undefined>;
  getFollowedUsers(userId: string): Promise<User[]>;
  getUserReactions(userId: string): Promise<string[]>;

  createGift(gift: InsertGift): Promise<Gift>;
  getGiftsByPost(postId: string): Promise<Gift[]>;
  getGiftsReceived(userId: string): Promise<Gift[]>;
  getGiftsSent(userId: string): Promise<Gift[]>;

  createTransaction(tx: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: string): Promise<Transaction[]>;
  getUnreadMessageCount(userId: string): Promise<number>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getTopUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.rating)).limit(10);
  }

  async searchUsers(query: string): Promise<User[]> {
    return db.select().from(users).where(
      or(
        ilike(users.username, `%${query}%`),
        ilike(users.displayName, `%${query}%`)
      )
    ).limit(20);
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

  async getPostById(id: string): Promise<(Post & { author: User }) | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    if (!post) return undefined;
    const [author] = await db.select().from(users).where(eq(users.id, post.userId));
    if (!author) return undefined;
    return { ...post, author };
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.userId, userId)).orderBy(desc(posts.createdAt));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async updatePostCounts(id: string, field: "likes" | "comments" | "reposts", delta: number): Promise<void> {
    await db.update(posts).set({
      [field]: sql`COALESCE(${posts[field]}, 0) + ${delta}`,
    }).where(eq(posts.id, id));
  }

  async getCommentsByPost(postId: string): Promise<(Comment & { author: User })[]> {
    const allComments = await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(comments.createdAt);
    const result: (Comment & { author: User })[] = [];
    for (const comment of allComments) {
      const [author] = await db.select().from(users).where(eq(users.id, comment.userId));
      if (author) {
        result.push({ ...comment, author });
      }
    }
    return result;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async createReaction(reaction: InsertReaction): Promise<Reaction> {
    const [created] = await db.insert(reactions).values(reaction).returning();
    return created;
  }

  async deleteReaction(userId: string, postId?: string, commentId?: string): Promise<void> {
    if (postId) {
      await db.delete(reactions).where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)));
    } else if (commentId) {
      await db.delete(reactions).where(and(eq(reactions.userId, userId), eq(reactions.commentId, commentId)));
    }
  }

  async getReaction(userId: string, postId?: string, commentId?: string): Promise<Reaction | undefined> {
    if (postId) {
      const [r] = await db.select().from(reactions).where(and(eq(reactions.userId, userId), eq(reactions.postId, postId)));
      return r;
    } else if (commentId) {
      const [r] = await db.select().from(reactions).where(and(eq(reactions.userId, userId), eq(reactions.commentId, commentId)));
      return r;
    }
    return undefined;
  }

  async follow(followerId: string, followingId: string): Promise<Follow> {
    const [created] = await db.insert(follows).values({ followerId, followingId }).returning();
    return created;
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await db.delete(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
  }

  async getFollowers(userId: string): Promise<User[]> {
    const followerIds = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, userId));
    if (followerIds.length === 0) return [];
    const result: User[] = [];
    for (const { followerId } of followerIds) {
      const [user] = await db.select().from(users).where(eq(users.id, followerId));
      if (user) result.push(user);
    }
    return result;
  }

  async getFollowing(userId: string): Promise<User[]> {
    const followingIds = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, userId));
    if (followingIds.length === 0) return [];
    const result: User[] = [];
    for (const { followingId } of followingIds) {
      const [user] = await db.select().from(users).where(eq(users.id, followingId));
      if (user) result.push(user);
    }
    return result;
  }

  async getFollowersCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, userId));
    return result?.count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, userId));
    return result?.count || 0;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db.select().from(follows).where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
    return !!result;
  }

  async getConversations(userId: string): Promise<(Conversation & { members: User[]; lastMessage?: Message })[]> {
    const memberRows = await db.select().from(conversationMembers).where(eq(conversationMembers.userId, userId));
    const result: (Conversation & { members: User[]; lastMessage?: Message })[] = [];
    for (const row of memberRows) {
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, row.conversationId));
      if (!conv) continue;
      const allMembers = await db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, conv.id));
      const memberUsers: User[] = [];
      for (const m of allMembers) {
        const [u] = await db.select().from(users).where(eq(users.id, m.userId));
        if (u) memberUsers.push(u);
      }
      const [lastMsg] = await db.select().from(messages).where(eq(messages.conversationId, conv.id)).orderBy(desc(messages.createdAt)).limit(1);
      result.push({ ...conv, members: memberUsers, lastMessage: lastMsg });
    }
    return result.sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() || 0;
      const bTime = b.lastMessageAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getOrCreateConversation(userIds: string[]): Promise<Conversation> {
    const sorted = [...userIds].sort();
    const firstUserConvs = await db.select().from(conversationMembers).where(eq(conversationMembers.userId, sorted[0]));
    for (const fc of firstUserConvs) {
      const allMembers = await db.select().from(conversationMembers).where(eq(conversationMembers.conversationId, fc.conversationId));
      const memberIds = allMembers.map((m: ConversationMember) => m.userId).sort();
      if (memberIds.length === sorted.length && memberIds.every((id: string, i: number) => id === sorted[i])) {
        const [conv] = await db.select().from(conversations).where(eq(conversations.id, fc.conversationId));
        if (conv) return conv;
      }
    }
    const [conv] = await db.insert(conversations).values({ isGroup: userIds.length > 2 }).returning();
    for (const uid of userIds) {
      await db.insert(conversationMembers).values({ conversationId: conv.id, userId: uid });
    }
    return conv;
  }

  async getMessages(conversationId: string): Promise<(Message & { sender: User })[]> {
    const allMsgs = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
    const result: (Message & { sender: User })[] = [];
    for (const msg of allMsgs) {
      const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId));
      if (sender) result.push({ ...msg, sender });
    }
    return result;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, message.conversationId));
    return created;
  }

  async markMessagesRead(conversationId: string, userId: string): Promise<void> {
    await db.update(messages).set({ isRead: true }).where(
      and(eq(messages.conversationId, conversationId), sql`${messages.senderId} != ${userId}`)
    );
  }

  async getNotifications(userId: string): Promise<(Notification & { actor?: User })[]> {
    const allNotifs = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(50);
    const result: (Notification & { actor?: User })[] = [];
    for (const notif of allNotifs) {
      let actor: User | undefined;
      if (notif.actorId) {
        const [a] = await db.select().from(users).where(eq(users.id, notif.actorId));
        actor = a;
      }
      result.push({ ...notif, actor });
    }
    return result;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return result?.count || 0;
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

  async getTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [t] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return t;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [created] = await db.insert(tournaments).values(tournament).returning();
    return created;
  }

  async joinTournament(tournamentId: string, userId: string, entryFee: number): Promise<TournamentEntry> {
    if (entryFee > 0) {
      await db.update(users).set({ coins: sql`COALESCE(${users.coins}, 0) - ${entryFee}` }).where(eq(users.id, userId));
      await db.update(tournaments).set({ prizePool: sql`${tournaments.prizePool} + ${entryFee}` }).where(eq(tournaments.id, tournamentId));
    }
    await db.update(tournaments).set({ currentPlayers: sql`COALESCE(${tournaments.currentPlayers}, 0) + 1` }).where(eq(tournaments.id, tournamentId));
    const [entry] = await db.insert(tournamentEntries).values({ tournamentId, userId }).returning();
    return entry;
  }

  async leaveTournament(tournamentId: string, userId: string): Promise<void> {
    await db.delete(tournamentEntries).where(and(eq(tournamentEntries.tournamentId, tournamentId), eq(tournamentEntries.userId, userId)));
    await db.update(tournaments).set({ currentPlayers: sql`GREATEST(COALESCE(${tournaments.currentPlayers}, 0) - 1, 0)` }).where(eq(tournaments.id, tournamentId));
  }

  async getTournamentEntries(tournamentId: string): Promise<(TournamentEntry & { user: User })[]> {
    const entries = await db.select().from(tournamentEntries).where(eq(tournamentEntries.tournamentId, tournamentId)).orderBy(desc(tournamentEntries.score));
    const result: (TournamentEntry & { user: User })[] = [];
    for (const entry of entries) {
      const [user] = await db.select().from(users).where(eq(users.id, entry.userId));
      if (user) result.push({ ...entry, user });
    }
    return result;
  }

  async getUserTournamentEntry(tournamentId: string, userId: string): Promise<TournamentEntry | undefined> {
    const [entry] = await db.select().from(tournamentEntries).where(
      and(eq(tournamentEntries.tournamentId, tournamentId), eq(tournamentEntries.userId, userId))
    );
    return entry;
  }

  async updateTournamentScore(tournamentId: string, userId: string, score: number): Promise<void> {
    await db.update(tournamentEntries).set({ score }).where(
      and(eq(tournamentEntries.tournamentId, tournamentId), eq(tournamentEntries.userId, userId))
    );
  }

  async getInvestmentsByUser(userId: string): Promise<Investment[]> {
    return db.select().from(investments).where(eq(investments.investorId, userId)).orderBy(desc(investments.createdAt));
  }

  async updateUserCoins(userId: string, delta: number): Promise<User | undefined> {
    const [updated] = await db.update(users).set({ coins: sql`COALESCE(${users.coins}, 0) + ${delta}` }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getFollowedUsers(userId: string): Promise<User[]> {
    const followingIds = await db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, userId));
    if (followingIds.length === 0) return [];
    const result: User[] = [];
    for (const { followingId } of followingIds) {
      const [user] = await db.select().from(users).where(eq(users.id, followingId));
      if (user) result.push(user);
    }
    return result;
  }

  async getUserReactions(userId: string): Promise<string[]> {
    const rxns = await db.select({ postId: reactions.postId }).from(reactions).where(eq(reactions.userId, userId));
    return rxns.map(r => r.postId).filter((id): id is string => !!id);
  }

  async createGift(gift: InsertGift): Promise<Gift> {
    const [created] = await db.insert(gifts).values(gift).returning();
    return created;
  }

  async getGiftsByPost(postId: string): Promise<Gift[]> {
    return db.select().from(gifts).where(eq(gifts.postId, postId)).orderBy(desc(gifts.createdAt));
  }

  async getGiftsReceived(userId: string): Promise<Gift[]> {
    return db.select().from(gifts).where(eq(gifts.receiverId, userId)).orderBy(desc(gifts.createdAt));
  }

  async getGiftsSent(userId: string): Promise<Gift[]> {
    return db.select().from(gifts).where(eq(gifts.senderId, userId)).orderBy(desc(gifts.createdAt));
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(tx).returning();
    return created;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(50);
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const memberRows = await db.select({ conversationId: conversationMembers.conversationId }).from(conversationMembers).where(eq(conversationMembers.userId, userId));
    let total = 0;
    for (const row of memberRows) {
      const [result] = await db.select({ count: count() }).from(messages).where(
        and(eq(messages.conversationId, row.conversationId), eq(messages.isRead, false), sql`${messages.senderId} != ${userId}`)
      );
      total += result?.count || 0;
    }
    return total;
  }
}

export const storage = new DatabaseStorage();
