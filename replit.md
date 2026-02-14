# SuperApp - Social Media Super Platform

## Overview
A mobile-first social media super-app with 5 major sections: Feed, AI Chat, Investment, Workspace, and Gaming. Built with React + Express + PostgreSQL.

## Architecture
- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui, wouter routing
- **Backend**: Express.js with PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL with Drizzle ORM
- **Theme**: Dark mode by default, purple primary color (270 76% 52%)

## Project Structure
- `client/src/pages/` - Main page components (feed, ai-chat, invest, workspace, gaming)
- `client/src/components/` - Reusable components (bottom-nav, story-bar, post-card)
- `client/src/lib/theme.tsx` - Theme provider with dark/light toggle
- `server/db.ts` - Database connection
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer
- `server/seed.ts` - Seed data for initial app state
- `shared/schema.ts` - Drizzle schemas for users, posts, chat_messages, investments, plugins, games

## API Routes
- GET/POST `/api/posts` - Feed posts
- GET `/api/users/top` - Top users for investment
- GET/POST `/api/chat` - AI chat messages
- GET/POST `/api/investments` - User investments
- GET `/api/plugins` - Marketplace plugins
- GET `/api/games` - Games listing

## Key Features
1. **Feed**: Instagram-like feed with coins (likes), repost, video/audio, gifts, comments, subscription, profile ratings
2. **AI Chat**: ChatGPT-like interface with Brain, Hourglass, Marketplace, Services tool icons
3. **Investment**: Invest in users and plugins with portfolio tracking
4. **Workspace**: n8n-like plugin builder with marketplace (CryptoPool, CopyX, UniNations, MAGA)
5. **Gaming**: Modern game discovery with categories, featured games, leaderboard

## Recent Changes
- Initial build: Feb 14, 2026
- All 5 sections implemented with full mobile UI
- PostgreSQL database with seed data
- Dark mode default theme
