'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { favorites as favoritesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Info, Loader2 } from 'lucide-react';

interface MovieCardProps {
  movie: {
    imdbID: string;
    Title: string;
    Year: string;
    Type?: string;
    Poster: string;
  };
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
  onDetailsClick: () => void;
}

export function MovieCard({ movie, isFavorite = false, onFavoriteChange, onDetailsClick }: MovieCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please login to add favorites', variant: 'destructive' });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (favorite) {
        await favoritesApi.remove(movie.imdbID);
        setFavorite(false);
        toast({ title: 'Removed from favorites' });
      } else {
        await favoritesApi.add(movie.imdbID);
        setFavorite(true);
        toast({ title: 'Added to favorites' });
      }
      onFavoriteChange?.();
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : 'Failed to update favorites', variant: 'destructive' });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const posterUrl = !imgError && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.svg';

  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
      <div className="relative aspect-[2/3]">
        <Image
          src={posterUrl}
          alt={movie.Title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onError={() => setImgError(true)}
          unoptimized={imgError}
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onDetailsClick}>
            <Info className="h-4 w-4 mr-1" />
            Details
          </Button>
          {user && (
            <Button
              size="sm"
              variant={favorite ? 'destructive' : 'secondary'}
              onClick={handleFavoriteClick}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
              )}
            </Button>
          )}
        </div>
        {movie.Type && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            {movie.Type}
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold truncate" title={movie.Title}>
          {movie.Title}
        </h3>
        <p className="text-sm text-muted-foreground">{movie.Year}</p>
      </CardContent>
    </Card>
  );
}
