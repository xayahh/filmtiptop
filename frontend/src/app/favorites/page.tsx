'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { FavoritesList } from '@/components/favorites/favorites-list';
import { MovieDetailModal } from '@/components/movies/movie-detail-modal';
import { Loader2 } from 'lucide-react';

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <FavoritesList onMovieClick={setSelectedMovie} />

      <MovieDetailModal
        imdbID={selectedMovie}
        open={!!selectedMovie}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
      />
    </div>
  );
}
