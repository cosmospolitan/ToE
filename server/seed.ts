import { db } from "./db";
import { users, posts, investments, plugins, games } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seed() {
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) return;

  const [user1, user2, user3] = await db.insert(users).values([
    { username: "alex_dev", displayName: "Alex Rivera", avatar: "/images/avatar2.png", bio: "Full-stack developer & crypto enthusiast", rating: 45, coins: 5200, isVerified: true, status: "online" },
    { username: "sarah_art", displayName: "Sarah Chen", avatar: "/images/avatar3.png", bio: "Digital artist & NFT creator", rating: 42, coins: 3800, isVerified: true, status: "online" },
    { username: "crypto_king", displayName: "Marcus Johnson", avatar: "/images/avatar1.png", bio: "Trader | Investor | Builder", rating: 48, coins: 12000, isVerified: true, status: "away" },
  ]).returning();

  await db.insert(posts).values([
    { userId: user1.id, content: "Just shipped a new DeFi protocol integration. The future of finance is decentralized!", imageUrl: "/images/post2.png", likes: 234, reposts: 45, comments: 32, coinCost: 0 },
    { userId: user2.id, content: "Golden hour never disappoints. Captured this beauty on my evening walk.", imageUrl: "/images/post1.png", likes: 567, reposts: 89, comments: 67, coinCost: 0 },
    { userId: user3.id, content: "Exclusive trading strategy breakdown - unlock to see my portfolio analysis", imageUrl: "/images/post3.png", likes: 890, reposts: 120, comments: 95, coinCost: 50 },
    { userId: user1.id, content: "Building something incredible with the new workspace editor. Stay tuned for the launch!", likes: 156, reposts: 23, comments: 18, coinCost: 0, audioUrl: "audio.mp3" },
    { userId: user2.id, content: "New digital art collection dropping this weekend. Who's excited?", imageUrl: "/images/post1.png", likes: 445, reposts: 67, comments: 54, coinCost: 25 },
  ]);

  await db.insert(investments).values([
    { investorId: "demo-user", targetType: "user", targetId: user1.id, targetName: "Alex Rivera", amount: 2500, returnRate: 18, status: "active" },
    { investorId: "demo-user", targetType: "user", targetId: user3.id, targetName: "Marcus Johnson", amount: 4000, returnRate: 35, status: "active" },
    { investorId: "demo-user", targetType: "plugin", targetId: "crypto-pool", targetName: "CryptoPool", amount: 3200, returnRate: 28, status: "active" },
    { investorId: "demo-user", targetType: "plugin", targetId: "copy-x", targetName: "CopyX", amount: 2750, returnRate: -5, status: "active" },
  ]);

  await db.insert(plugins).values([
    { name: "DataSync Pro", description: "Real-time data synchronization across multiple platforms", category: "utility", price: 500, authorId: user1.id, authorName: "Alex Rivera", downloads: 3400, rating: 44, isOfficial: false, status: "published" },
    { name: "AutoTrader Bot", description: "Automated trading with customizable strategies and risk management", category: "finance", price: 1200, authorId: user3.id, authorName: "Marcus Johnson", downloads: 7800, rating: 46, isOfficial: false, status: "published" },
    { name: "Social Analytics", description: "Deep insights into your social engagement and audience growth", category: "analytics", price: 300, authorId: user2.id, authorName: "Sarah Chen", downloads: 5600, rating: 43, isOfficial: false, status: "published" },
    { name: "NFT Minter", description: "One-click NFT minting with IPFS storage and multi-chain support", category: "crypto", price: 800, authorId: user2.id, authorName: "Sarah Chen", downloads: 4200, rating: 41, isOfficial: false, status: "published" },
  ]);

  await db.insert(games).values([
    { title: "Pixel Kingdoms", description: "Build and defend your pixelated empire", category: "strategy", players: 5600, rating: 44, isLive: true },
    { title: "Speed Rush", description: "High-octane racing with crypto rewards", category: "racing", players: 3200, rating: 42, isLive: false },
    { title: "Puzzle Master", description: "Brain-teasing challenges with daily rewards", category: "puzzle", players: 8900, rating: 47, isLive: false },
    { title: "Battle Royale X", description: "Last player standing wins the prize pool", category: "action", players: 12000, rating: 46, isLive: true },
    { title: "Card Legends", description: "Collectible card game with NFT integration", category: "strategy", players: 4500, rating: 43, isLive: false },
    { title: "Space Miners", description: "Mine asteroids and trade resources", category: "adventure", players: 2800, rating: 41, isLive: false },
  ]);

  console.log("Database seeded successfully");
}
