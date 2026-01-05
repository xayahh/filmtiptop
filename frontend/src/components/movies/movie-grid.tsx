'use client';

import { MovieCard } from './movie-card';
import { Pagination } from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';

interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type?: string;
  Poster: string;
}

interface MovieGridProps {
  movies: Movie[];
  totalResults?: number;
  currentPage?: number;
  totalPages?: number;
  isLoading: boolean;
  error?: string;
  favoriteIds?: string[];
  onFavoriteChange?: () => void;
  onMovieClick: (imdbID: string) => void;
  onPageChange?: (page: number) => void;
}

export function MovieGrid({
  movies,
  totalResults,
  currentPage = 1,
  totalPages = 1,
  isLoading,
  error,
  favoriteIds = [],
  onFavoriteChange,
  onMovieClick,
  onPageChange,
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No movies found. Try a different search.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {totalResults && (
        <p className="text-sm text-muted-foreground">
          Found {totalResults} results (page {currentPage} of {totalPages})
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.imdbID}
            movie={movie}
            isFavorite={favoriteIds.includes(movie.imdbID)}
            onFavoriteChange={onFavoriteChange}
            onDetailsClick={() => onMovieClick(movie.imdbID)}
          />
        ))}
      </div>
      {onPageChange && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
