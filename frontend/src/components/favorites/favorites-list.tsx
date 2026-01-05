'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { favorites as favoritesApi, Movie } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, Trash2, Info } from 'lucide-react';
import Image from 'next/image';

interface FavoritesListProps {
  onMovieClick: (imdbID: string) => void;
}

export function FavoritesList({ onMovieClick }: FavoritesListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await favoritesApi.getAll();
      setMovies(data);
    } catch {
      toast({ title: 'Failed to load favorites', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  const handleRemove = async (imdbID: string) => {
    setRemovingId(imdbID);
    try {
      await favoritesApi.remove(imdbID);
      setMovies(movies.filter((m) => m.imdbID !== imdbID));
      toast({ title: 'Removed from favorites' });
    } catch {
      toast({ title: 'Failed to remove from favorites', variant: 'destructive' });
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
        <p className="text-muted-foreground">
          Start adding movies to your favorites from the search page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Favorites</h2>
        <span className="text-muted-foreground">{movies.length} movies</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Card key={movie.imdbID} className="overflow-hidden group">
            <div className="relative aspect-[2/3]">
              <Image
                src={!failedImages.has(movie.imdbID) && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.svg'}
                alt={movie.Title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                onError={() => setFailedImages(prev => new Set(prev).add(movie.imdbID))}
                unoptimized={failedImages.has(movie.imdbID)}
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onMovieClick(movie.imdbID)}
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(movie.imdbID)}
                  disabled={removingId === movie.imdbID}
                >
                  {removingId === movie.imdbID ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold truncate" title={movie.Title}>
                {movie.Title}
              </h3>
              <p className="text-sm text-muted-foreground">{movie.Year}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
