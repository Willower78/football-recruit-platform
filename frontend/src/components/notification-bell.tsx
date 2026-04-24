'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    try {
      const res = await api<{ count: number }>('/notifications/unread-count');
      setUnreadCount(res.count);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  async function handleOpen() {
    setOpen((prev) => !prev);
    if (!open) {
      try {
        const res = await api<{ items: NotificationItem[] }>('/notifications?limit=10');
        setNotifications(res.items);
      } catch {
        /* noop */
      }
    }
  }

  async function markAllRead() {
    try {
      await api('/notifications/read-all', { method: 'POST' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* noop */
    }
  }

  function handleClick(n: NotificationItem) {
    api(`/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {});
    setOpen(false);

    const meta = n.metadata as Record<string, string>;
    if (n.type === 'verification_approved' || n.type === 'verification_rejected') {
      router.push('/dashboard/club');
    } else if (meta.link) {
      router.push(meta.link);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-1 text-muted-foreground hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`block w-full border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
