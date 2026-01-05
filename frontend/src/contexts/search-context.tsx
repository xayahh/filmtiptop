'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { movies as moviesApi, Movie } from '@/lib/api';

export type SortOption = 'default' | 'rating' | 'popularity' | 'favorites';

interface SearchMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
  imdbRating?: string;
  imdbVotes?: string;
}

interface SearchContextType {
  searchTerm: string;
  searchYear: string;
  movies: SearchMovie[];
  sortedMovies: SearchMovie[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string;
  sortBy: SortOption;
  performSearch: (title: string, year?: string, page?: number) => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  setSortBy: (sort: SortOption) => void;
  setFavoriteIds: (ids: string[]) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [movies, setMovies] = useState<SearchMovie[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [movieDetails, setMovieDetails] = useState<Map<string, Movie>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const totalPages = Math.ceil(totalResults / 10);

  const fetchMovieDetails = useCallback(async (imdbIDs: string[]) => {
    const newDetails = new Map(movieDetails);
    const idsToFetch = imdbIDs.filter((id) => !newDetails.has(id));
    if (idsToFetch.length === 0) return newDetails;
    const results = await Promise.allSettled(
      idsToFetch.map((id) => moviesApi.get(id))
    );
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        newDetails.set(idsToFetch[idx], result.value);
      }
    });
    setMovieDetails(newDetails);
    return newDetails;
  }, [movieDetails]);

  const performSearch = useCallback(async (title: string, year?: string, page: number = 1) => {
    if (!title.trim()) return;
    setSearchTerm(title);
    setSearchYear(year || '');
    setCurrentPage(page);
    setIsLoading(true);
    setError('');
    try {
      const result = await moviesApi.search({ s: title, y: year, page });
      const searchResults = result.Search || [];
      setMovies(searchResults);
      setTotalResults(parseInt(result.totalResults) || 0);
      if (searchResults.length > 0 && sortBy !== 'default') {
        await fetchMovieDetails(searchResults.map((m) => m.imdbID));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setMovies([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, fetchMovieDetails]);

  const goToPage = useCallback(async (page: number) => {
    if (!searchTerm || page < 1 || page > totalPages) return;
    await performSearch(searchTerm, searchYear || undefined, page);
  }, [searchTerm, searchYear, totalPages, performSearch]);

  const handleSortChange = useCallback(async (newSort: SortOption) => {
    setSortBy(newSort);
    if (newSort !== 'default' && movies.length > 0) {
      await fetchMovieDetails(movies.map((m) => m.imdbID));
    }
  }, [movies, fetchMovieDetails]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchYear('');
    setMovies([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError('');
    setSortBy('default');
  }, []);

  const sortedMovies = useMemo(() => {
    if (sortBy === 'default' || movies.length === 0) {
      return movies;
    }
    return [...movies].sort((a, b) => {
      if (sortBy === 'favorites') {
        const aIsFav = favoriteIds.includes(a.imdbID) ? 1 : 0;
        const bIsFav = favoriteIds.includes(b.imdbID) ? 1 : 0;
        return bIsFav - aIsFav;
      }
      const detailA = movieDetails.get(a.imdbID);
      const detailB = movieDetails.get(b.imdbID);
      if (sortBy === 'rating') {
        const ratingA = parseFloat(detailA?.imdbRating || '0');
        const ratingB = parseFloat(detailB?.imdbRating || '0');
        return ratingB - ratingA;
      }
      if (sortBy === 'popularity') {
        const votesA = parseInt((detailA?.imdbVotes || '0').replace(/,/g, ''));
        const votesB = parseInt((detailB?.imdbVotes || '0').replace(/,/g, ''));
        return votesB - votesA;
      }
      return 0;
    });
  }, [movies, sortBy, movieDetails, favoriteIds]);

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        searchYear,
        movies,
        sortedMovies,
        totalResults,
        currentPage,
        totalPages,
        isLoading,
        error,
        sortBy,
        performSearch,
        goToPage,
        setSortBy: handleSortChange,
        setFavoriteIds,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
