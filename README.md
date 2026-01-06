# FilmTipTop Frontend

Next.js 14 frontend for the FilmTipTop movie discovery platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home/Search page
│   ├── favorites/         # Favorites page (auth required)
│   ├── blog/              # Blog listing page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, AppLayout
│   ├── auth/              # Login/Register modals
│   ├── movies/            # MovieCard, MovieGrid, SearchForm, MovieDetailModal
│   ├── favorites/         # FavoritesList
│   └── blog/              # BlogPostCard, BlogList, CreatePostModal
├── contexts/
│   ├── auth-context.tsx   # Authentication state
│   └── search-context.tsx # Search state persistence
├── hooks/
│   └── use-toast.ts       # Toast notifications
└── lib/
    ├── api.ts             # API client with typed endpoints
    └── utils.ts           # Utility functions (cn)
```

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on port 3000

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

Runs on http://localhost:3000 by default. Use `-p 3001` when running alongside backend:

```bash
npm run dev -- -p 3001
```

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Features

### Search
- Movie search via OMDb API proxy
- Filter by year
- Quick search tags
- Search state persists across navigation

### Authentication
- JWT-based auth
- Login/Register modals
- Protected routes (favorites)

### Favorites
- Add/remove movies from favorites
- Synced with backend

### Reviews
- Rate movies 1-10
- One review per user per movie
- View all reviews in movie detail modal

### Blog
- Create/edit/delete posts
- Pagination
- Tag movies in posts

## API Client

All API calls go through `src/lib/api.ts`:

```typescript
import { auth, movies, favorites, reviews, blog } from '@/lib/api';

// Search movies
const results = await movies.search({ s: 'Matrix', y: '1999' });

// Get movie details
const movie = await movies.get('tt0133093');

// Auth
await auth.login({ email, password });
await auth.register({ username, email, password });

// Favorites (requires auth)
await favorites.add(imdbID);
await favorites.remove(imdbID);

// Reviews (requires auth)
await reviews.add({ imdbID, rating: 9, comment: 'Great movie' });

// Blog (requires auth for write operations)
await blog.create({ title, content, tags: ['sci-fi'] });
```

## Docker

Development Dockerfile at `Dockerfile.dev`:

```bash
docker build -f Dockerfile.dev -t frontend .
docker run -p 3001:3000 frontend
```

Or use docker-compose from project root:

```bash
docker compose up frontend
```
