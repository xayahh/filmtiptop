'use client';

import { useState } from 'react';
import { BlogList } from '@/components/blog/blog-list';
import { BlogPostModal } from '@/components/blog/blog-post-modal';
import { CreatePostModal } from '@/components/blog/create-post-modal';
import { BlogPost } from '@/lib/api';

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
  };

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(null);
    setEditPost(post);
    setCreateOpen(true);
  };

  const handleCreateSuccess = () => {
    setEditPost(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="container py-8">
      <BlogList
        key={refreshKey}
        onPostClick={handlePostClick}
        onCreateClick={() => {
          setEditPost(null);
          setCreateOpen(true);
        }}
      />

      <BlogPostModal
        post={selectedPost}
        open={!!selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CreatePostModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        editPost={editPost}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
