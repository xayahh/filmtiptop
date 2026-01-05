'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { blog as blogApi, BlogPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BlogPostCard } from './blog-post-card';
import { Button } from '@/components/ui/button';
import { Loader2, PenSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogListProps {
  onPostClick: (post: BlogPost) => void;
  onCreateClick: () => void;
}

export function BlogList({ onPostClick, onCreateClick }: BlogListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await blogApi.getAll(currentPage);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch {
      toast({ title: 'Failed to load posts', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog</h2>
        {user && (
          <Button onClick={onCreateClick}>
            <PenSquare className="mr-2 h-4 w-4" />
            Write Post
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blog posts yet.</p>
          {user && (
            <Button onClick={onCreateClick} className="mt-4">
              Write the first post
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <BlogPostCard
                key={post._id}
                post={post}
                onClick={() => onPostClick(post)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
