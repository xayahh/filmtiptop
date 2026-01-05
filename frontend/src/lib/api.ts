const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

let token: string | null = null;

export const setToken = (newToken: string | null) => {
  token = newToken;
  if (newToken) {
    localStorage.setItem('token', newToken);
  } else {
    localStorage.removeItem('token');
  }
};

export const getToken = () => {
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  return token;
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const currentToken = getToken();
  if (currentToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${currentToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  favorites?: string[];
  favoriteGenres?: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Movie {
  _id?: string;
  imdbID: string;
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  Ratings?: { Source: string; Value: string }[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  Type?: string;
  TrailerURL?: string;
}

export interface SearchResult {
  Search: { imdbID: string; Title: string; Year: string; Type: string; Poster: string }[];
  totalResults: string;
}

export interface Review {
  _id: string;
  user: { _id: string; username: string };
  imdbID: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  author: { _id: string; username: string };
  title: string;
  content: string;
  relatedMovie?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export const auth = {
  register: (data: { username: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getProfile: () => request<User>('/auth/profile'),

  updateProfile: (data: { username?: string; email?: string; favoriteGenres?: string[] }) =>
    request<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

export const movies = {
  search: (params: { s: string; y?: string; type?: string; page?: number }) => {
    const query = new URLSearchParams();
    query.set('s', params.s);
    if (params.y) query.set('y', params.y);
    if (params.type) query.set('type', params.type);
    if (params.page) query.set('page', params.page.toString());
    return request<SearchResult>(`/movies/search?${query.toString()}`);
  },

  get: (imdbID: string) => request<Movie>(`/movies/${imdbID}`),

  add: (data: Partial<Movie>) =>
    request<Movie>('/movies', { method: 'POST', body: JSON.stringify(data) }),

  updateTrailer: (imdbID: string, trailerURL: string) =>
    request<Movie>(`/movies/${imdbID}/trailer`, { method: 'PUT', body: JSON.stringify({ trailerURL }) }),
};

export const favorites = {
  getAll: () => request<Movie[]>('/favorites'),

  add: (imdbID: string) =>
    request<{ message: string; favorites: string[] }>('/favorites', { method: 'POST', body: JSON.stringify({ imdbID }) }),

  remove: (imdbID: string) =>
    request<{ message: string; favorites: string[] }>(`/favorites/${imdbID}`, { method: 'DELETE' }),

  check: (imdbID: string) => request<{ isFavorite: boolean }>(`/favorites/check/${imdbID}`),
};

export const reviews = {
  getByMovie: (imdbID: string) => request<Review[]>(`/reviews/movie/${imdbID}`),

  add: (data: { imdbID: string; rating: number; comment: string }) =>
    request<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) => request<{ message: string }>(`/reviews/${id}`, { method: 'DELETE' }),

  getUserReviews: () => request<Review[]>('/reviews/user'),
};

export const blog = {
  getAll: (page = 1, limit = 10) => request<BlogListResponse>(`/blog?page=${page}&limit=${limit}`),

  get: (id: string) => request<BlogPost>(`/blog/${id}`),

  create: (data: { title: string; content: string; relatedMovie?: string; tags?: string[] }) =>
    request<BlogPost>('/blog', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { title?: string; content?: string; relatedMovie?: string; tags?: string[] }) =>
    request<BlogPost>(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request<{ message: string }>(`/blog/${id}`, { method: 'DELETE' }),
};
