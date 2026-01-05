'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useSearch } from '@/contexts/search-context';
import { favorites as favoritesApi } from '@/lib/api';
import { SearchForm } from '@/components/movies/search-form';
import { MovieGrid } from '@/components/movies/movie-grid';
import { MovieDetailModal } from '@/components/movies/movie-detail-modal';
import { SearchFilters } from '@/components/movies/search-filters';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    searchTerm,
    searchYear,
    sortedMovies,
    totalResults,
    currentPage,
    totalPages,
    isLoading,
    error,
    sortBy,
    performSearch,
    goToPage,
    setSortBy,
    setFavoriteIds: setContextFavoriteIds,
    clearSearch,
  } = useSearch();
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const initialSyncDone = useRef(false);

  const queryTitle = searchParams.get('q') || '';
  const queryYear = searchParams.get('y') || '';

  useEffect(() => {
    if (user) {
      fetchFavoriteIds();
    } else {
      setFavoriteIds([]);
    }
  }, [user]);

  useEffect(() => {
    setContextFavoriteIds(favoriteIds);
  }, [favoriteIds, setContextFavoriteIds]);

  const fetchFavoriteIds = async () => {
    try {
      const favs = await favoritesApi.getAll();
      setFavoriteIds(favs.map((f) => f.imdbID));
    } catch {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    if (initialSyncDone.current) return;
    if (queryTitle && queryTitle !== searchTerm) {
      performSearch(queryTitle, queryYear || undefined);
      initialSyncDone.current = true;
    }
  }, [queryTitle, queryYear, searchTerm, performSearch]);

  const handleSearch = (title: string, year?: string) => {
    performSearch(title, year);
    const params = new URLSearchParams();
    params.set('q', title);
    if (year) params.set('y', year);
    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    clearSearch();
    router.push('/');
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Discover Movies</h1>
        <p className="text-muted-foreground">
          Search for your favorite movies, add them to favorites, and share reviews
        </p>
      </div>

      <SearchForm
        onSearch={handleSearch}
        onClear={handleClear}
        isLoading={isLoading}
        initialTitle={searchTerm}
        initialYear={searchYear}
      />

      {sortedMovies.length > 0 && (
        <SearchFilters
          sortBy={sortBy}
          onSortChange={setSortBy}
          showFavoritesFilter={!!user}
        />
      )}

      <MovieGrid
        movies={sortedMovies}
        totalResults={totalResults}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        error={error}
        favoriteIds={favoriteIds}
        onFavoriteChange={fetchFavoriteIds}
        onMovieClick={setSelectedMovie}
        onPageChange={goToPage}
      />

      <MovieDetailModal
        imdbID={selectedMovie}
        open={!!selectedMovie}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="container py-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
