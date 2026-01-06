# FilmTipTop Backend

Express.js 5 REST API for the FilmTipTop movie discovery platform.

## Tech Stack

- **Framework**: Express.js 5
- **Database**: MongoDB (Mongoose 9)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **External API**: OMDb API

## Project Structure

```
src/
├── server.js              # Express app entry point
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User schema (username, email, password, favorites, role)
│   ├── Movie.js           # Cached movie data from OMDb
│   ├── Review.js          # User reviews (rating 1-10, comment)
│   └── BlogPost.js        # Blog posts (title, content, tags)
├── controllers/
│   ├── authController.js      # Register, login, profile
│   ├── movieController.js     # Search, get, cache
│   ├── favoritesController.js # Add/remove favorites
│   ├── reviewController.js    # CRUD reviews
│   └── blogController.js      # CRUD blog posts
└── routes/
    ├── auth.js            # /api/auth/*
    ├── movies.js          # /api/movies/*
    ├── favorites.js       # /api/favorites/*
    ├── reviews.js         # /api/reviews/*
    └── blog.js            # /api/blog/*
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance
- OMDb API key

### Installation

```bash
npm install
```

### Environment Variables

Create `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/filmtiptop
JWT_SECRET=your-secret-key
OMDB_API_KEY=your-omdb-api-key
FRONTEND_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Uses nodemon for hot reloading.

### Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Get JWT token |
| GET | `/profile` | Yes | Get current user |
| PUT | `/profile` | Yes | Update profile |
| PUT | `/change-password` | Yes | Change password |

**Register/Login Response:**
```json
{
  "token": "jwt-token",
  "user": { "id", "username", "email", "role" }
}
```

### Movies (`/api/movies`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search?s=title&y=year` | No | Search OMDb |
| GET | `/:imdbID` | No | Get movie details |
| POST | `/` | Yes | Add movie manually |
| PUT | `/:imdbID/trailer` | Yes | Update trailer URL |

Movies are cached in MongoDB after first OMDb fetch.

### Favorites (`/api/favorites`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Yes | Get all favorites |
| POST | `/` | Yes | Add favorite |
| DELETE | `/:imdbID` | Yes | Remove favorite |
| GET | `/check/:imdbID` | Yes | Check if favorited |

### Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/movie/:imdbID` | No | Get reviews for movie |
| GET | `/user` | Yes | Get user's reviews |
| POST | `/` | Yes | Create review |
| DELETE | `/:id` | Yes | Delete own review |

**Constraints:**
- Rating: 1-10
- One review per user per movie

### Blog (`/api/blog`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/?page=1&limit=10` | No | List posts (paginated) |
| GET | `/:id` | No | Get single post |
| POST | `/` | Yes | Create post |
| PUT | `/:id` | Yes | Update own post |
| DELETE | `/:id` | Yes | Delete own post |

## Authentication

JWT tokens are passed in the Authorization header:

```
Authorization: Bearer <token>
```

The `auth` middleware validates tokens and attaches `req.userId` to authenticated requests.

## Models

### User
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  favorites: [String],       // imdbIDs
  favoriteGenres: [String]
}
```

### Movie
```javascript
{
  imdbID: String (unique),
  Title: String,
  Year: String,
  Poster: String,
  // ... full OMDb response fields
  TrailerURL: String
}
```

### Review
```javascript
{
  user: ObjectId (ref User),
  imdbID: String,
  rating: Number (1-10),
  comment: String
}
// Compound unique index: user + imdbID
```

### BlogPost
```javascript
{
  author: ObjectId (ref User),
  title: String,
  content: String,
  relatedMovie: String,      // imdbID
  tags: [String]
}
```

## Docker

Development Dockerfile at `Dockerfile.dev`:

```bash
docker build -f Dockerfile.dev -t backend .
docker run -p 3000:3000 --env-file .env backend
```

Or use docker-compose from project root:

```bash
docker compose up backend
```

## Error Handling

All errors return JSON:

```json
{
  "message": "Error description"
}
```

HTTP status codes:
- 400: Bad request / validation error
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error
