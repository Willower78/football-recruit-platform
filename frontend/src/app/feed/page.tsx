'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { api, tokenStore } from '@/lib/api';

interface PostAuthor {
  id: string;
  email: string;
  role: string;
}

interface FeedPost {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: 'video' | 'image' | null;
  visibility: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  liked: boolean;
  author: PostAuthor;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFeed = useCallback(async () => {
    try {
      const res = await api<{ items: FeedPost[] }>('/social/feed', { skipAuth: !user });
      setPosts(res.items ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null);
  }

  async function handlePost(e: FormEvent) {
    e.preventDefault();
    if (!newPostContent.trim() && !selectedFile) return;
    setPosting(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: 'video' | 'image' | undefined;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        const uploadRes = await fetch(`${apiBase}/media/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${tokenStore.access}` },
          body: formData,
        });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          mediaUrl = data.url;
          mediaType = data.mediaType;
        }
      }

      await api('/social/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: newPostContent.trim(),
          ...(mediaUrl && { mediaUrl, mediaType }),
        }),
      });
      setNewPostContent('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadFeed();
    } catch {
      /* noop */
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    try {
      const res = await api<{ liked: boolean }>(`/social/posts/${postId}/like`, {
        method: 'POST',
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: res.liked,
                likesCount: p.likesCount + (res.liked ? 1 : -1),
              }
            : p,
        ),
      );
    } catch {
      /* noop */
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container max-w-2xl py-10 space-y-6">
        <h1 className="text-2xl font-semibold">Feed</h1>

        {/* New post form */}
        {user && (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handlePost} className="space-y-3">
                <textarea
                  className="w-full min-h-[80px] resize-none rounded-md border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Share an update with the community..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  maxLength={2000}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="text-xs file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium"
                    />
                    {selectedFile && (
                      <span className="text-xs text-muted-foreground">{selectedFile.name}</span>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={posting || (!newPostContent.trim() && !selectedFile)}
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              No posts yet. Be the first to share something!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} user={user} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function PostCard({
  post,
  onLike,
  user,
}: {
  post: FeedPost;
  onLike: (id: string) => void;
  user: { id: string } | null;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  async function loadComments() {
    setLoadingComments(true);
    try {
      const res = await api<{ items: Comment[] }>(`/social/posts/${post.id}/comments`, {
        skipAuth: true,
      });
      setComments(res.items ?? []);
    } catch {
      /* noop */
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api(`/social/posts/${post.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() }),
      });
      setNewComment('');
      await loadComments();
    } catch {
      /* noop */
    }
  }

  function toggleComments() {
    if (!showComments) {
      void loadComments();
    }
    setShowComments(!showComments);
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{post.author.email.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author.email}</p>
            <p className="text-xs text-muted-foreground">
              {post.author.role} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        {/* Media */}
        {post.mediaUrl && post.mediaType === 'video' && (
          <video src={post.mediaUrl} controls className="w-full rounded-md" />
        )}
        {post.mediaUrl && post.mediaType === 'image' && (
          <img src={post.mediaUrl} alt="" className="w-full rounded-md" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={() => user && onLike(post.id)}
            disabled={!user}
            className={`text-sm flex items-center gap-1 ${
              post.liked ? 'text-secondary font-medium' : 'text-muted-foreground hover:text-foreground'
            } disabled:opacity-50`}
          >
            {post.liked ? '♥' : '♡'} {post.likesCount}
          </button>
          <button
            onClick={toggleComments}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            💬 {post.commentsCount}
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3 pt-3 border-t">
            {loadingComments ? (
              <Skeleton className="h-8" />
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {c.author.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{c.author.email}</p>
                    <p className="text-sm">{c.content}</p>
                  </div>
                </div>
              ))
            )}
            {user && (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  className="flex-1 rounded-md border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={1000}
                />
                <Button type="submit" size="sm" variant="outline" disabled={!newComment.trim()}>
                  Send
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
