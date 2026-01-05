'use client';

import { useAuth } from '@/contexts/auth-context';
import { blog as blogApi, BlogPost } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, Edit, Trash2 } from 'lucide-react';

interface BlogPostModalProps {
  post: BlogPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: () => void;
}

export function BlogPostModal({ post, open, onOpenChange, onEdit, onDelete }: BlogPostModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!post) return;
    try {
      await blogApi.delete(post._id);
      toast({ title: 'Post deleted' });
      onDelete();
      onOpenChange(false);
    } catch {
      toast({ title: 'Failed to delete post', variant: 'destructive' });
    }
  };

  const canModify = user && post && (user.id === post.author._id || user.role === 'admin');

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 pr-4">
            <DialogHeader>
              <DialogTitle className="text-2xl">{post.title}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {post.author.username}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
            </DialogHeader>

            {canModify && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}

            <Separator />

            <div className="prose prose-sm dark:prose-invert max-w-none">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {post.tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
