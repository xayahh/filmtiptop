'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { movies as moviesApi, reviews as reviewsApi, Movie, Review } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Star, Loader2, Trash2 } from 'lucide-react';

interface MovieDetailModalProps {
  imdbID: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovieDetailModal({ imdbID, open, onOpenChange }: MovieDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(7);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fetchMovieData = useCallback(async () => {
    if (!imdbID) return;
    setIsLoading(true);
    setImgError(false);
    try {
      const [movieData, reviewsData] = await Promise.all([
        moviesApi.get(imdbID),
        reviewsApi.getByMovie(imdbID),
      ]);
      setMovie(movieData);
      setReviews(reviewsData);
    } catch {
      toast({ title: 'Failed to load movie details', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [imdbID, toast]);

  useEffect(() => {
    if (imdbID && open) {
      fetchMovieData();
    }
  }, [imdbID, open, fetchMovieData]);

  const handleSubmitReview = async () => {
    if (!imdbID || !reviewComment.trim()) return;
    setIsSubmitting(true);
    try {
      const newReview = await reviewsApi.add({
        imdbID,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews([newReview, ...reviews]);
      setReviewComment('');
      setReviewRating(7);
      toast({ title: 'Review submitted!' });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : 'Failed to submit review', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewsApi.delete(reviewId);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      toast({ title: 'Review deleted' });
    } catch {
      toast({ title: 'Failed to delete review', variant: 'destructive' });
    }
  };

  const userHasReviewed = reviews.some((r) => r.user._id === user?.id);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <ScrollArea className="max-h-[80vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : movie ? (
            <div className="space-y-6 pr-4">
              <DialogHeader>
                <DialogTitle className="text-2xl">{movie.Title}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative w-full sm:w-48 aspect-[2/3] flex-shrink-0">
                  <Image
                    src={!imgError && movie.Poster !== 'N/A' ? movie.Poster : '/placeholder-movie.svg'}
                    alt={movie.Title}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => setImgError(true)}
                    unoptimized={imgError}
                  />
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {movie.Year && <Badge variant="outline">{movie.Year}</Badge>}
                    {movie.Rated && <Badge variant="outline">{movie.Rated}</Badge>}
                    {movie.Runtime && <Badge variant="outline">{movie.Runtime}</Badge>}
                    {movie.imdbRating && (
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {movie.imdbRating}
                      </Badge>
                    )}
                  </div>
                  {movie.Genre && (
                    <div className="flex flex-wrap gap-1">
                      {movie.Genre.split(', ').map((genre) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {movie.Plot && <p className="text-sm text-muted-foreground">{movie.Plot}</p>}
                  {movie.Director && (
                    <p className="text-sm">
                      <span className="font-medium">Director:</span> {movie.Director}
                    </p>
                  )}
                  {movie.Actors && (
                    <p className="text-sm">
                      <span className="font-medium">Cast:</span> {movie.Actors}
                    </p>
                  )}
                </div>
              </div>

              {movie.TrailerURL ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Trailer</h3>
                  <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                      src={movie.TrailerURL}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${movie.Title} Trailer`}
                    />
                  </div>
                </div>
              ) : null}

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Reviews ({reviews.length})</h3>

                {user && !userHasReviewed && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your Rating: {reviewRating}/10</span>
                      </div>
                      <Slider
                        value={[reviewRating]}
                        onValueChange={(v) => setReviewRating(v[0])}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    <Textarea
                      placeholder="Write your review..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting || !reviewComment.trim()}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Review
                    </Button>
                  </div>
                )}

                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.user.username}</span>
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {review.rating}/10
                          </Badge>
                        </div>
                        {(user?.id === review.user._id || user?.role === 'admin') && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteReview(review._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No reviews yet. Be the first to review!
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
