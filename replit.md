# SuperApp - Social Media Super Platform

## Overview
A mobile-first social media super-app with 5 major sections: Feed, AI Chat, Investment, Workspace, and Gaming. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui, wouter routing
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL with Drizzle ORM
- **Theme**: Dark mode by default, purple primary color (270 76% 52%)
- **Auth**: Session-based with passport-local, bcrypt password hashing

## Project Structure
- `client/src/pages/` - Main page components (feed, ai-chat, invest, workspace, gaming, profile, messages, notifications, balance, settings)
- `client/src/components/` - Reusable components (bottom-nav, story-bar, post-card, status-avatar)
- `client/src/lib/theme.tsx` - Theme provider with dark/light toggle (uses toggleTheme function, not setTheme)
- `client/src/lib/auth.tsx` - Auth context with login/register/logout
- `server/db.ts` - Database connection
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `server/seed.ts` - Seed data for initial app state
- `shared/schema.ts` - Drizzle schemas for users, posts, chat_messages, investments, plugins, games, follows, messages, notifications, transactions

## API Routes
- GET/POST `/api/posts` - Feed posts
- POST `/api/posts/:id/like` - Like/unlike posts
- POST `/api/gifts` - Send coin gift on post
- POST `/api/posts/:id/comment` - Add comment
- GET `/api/posts/:id/comments` - Get post comments
- GET `/api/users/top` - Top users for investment
- GET/POST `/api/chat` - AI chat messages
- GET/POST `/api/investments` - User investments
- GET `/api/plugins` - Marketplace plugins
- GET `/api/games` - Games listing
- GET `/api/stories` - Story bar users
- GET `/api/users/:id` - User profile
- POST `/api/users/:id/follow` - Follow/unfollow user
- PATCH `/api/users/profile` - Update profile
- GET/POST `/api/messages` - Direct messages
- GET `/api/messages/conversations` - Message conversations
- GET `/api/notifications` - User notifications
- GET `/api/transactions` - Transaction history
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login (sets isOnline=true)
- POST `/api/auth/logout` - Logout (sets isOnline=false)
- GET `/api/auth/me` - Current user
- GET `/api/search` - Search users/posts

## Key Features
1. **Feed**: Instagram-like feed with coins (likes), repost, video/audio icons, gifts, comments, coin-gated posts, subscription, profile ratings
2. **AI Chat**: ChatGPT-like interface with auth-aware personalized responses
3. **Investment**: Invest in users with real coin-based invest/withdraw actions
4. **Workspace**: n8n-like plugin builder with marketplace (CryptoPool, CopyX, UniNations, MAGA)
5. **Gaming**: Modern game discovery with categories, featured games, leaderboard
6. **Status System**: Instagram-like online/away/offline indicators on all avatars with activity tracking
7. **Gift System**: Send coins to post authors with real deduction/addition
8. **Balance Page**: Transaction history with filtering
9. **Settings Page**: Inline profile editing, theme toggle

## Status System
- `StatusAvatar` component at `client/src/components/status-avatar.tsx`
- Shows colored dot: green=online, yellow=away, gray=offline
- Shows Instagram-style gradient ring for story status
- `formatLastSeen()` helper shows "Online now", "Active Xm/h/d ago"
- Middleware auto-updates `lastSeen` on every authenticated API call
- Login sets `isOnline=true`, logout sets `isOnline=false`
- Used across: Feed, StoryBar, PostCard, Profile, Messages, Notifications, Settings

## Recent Changes
- Initial build: Feb 14, 2026
- All 5 sections implemented with full mobile UI
- PostgreSQL database with seed data
- Dark mode default theme
- Authentication system with session management
- Follow/unfollow system
- Direct messaging
- Notifications with badges
- Search functionality
- Instagram-like status system with online/away/offline indicators
- Gift/transaction system with Balance page
- Settings page with inline profile editing
