'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const router = useRouter();

  function load(p = page) {
    api<{ items: NotificationItem[]; total: number }>(`/notifications?page=${p}&limit=20`)
      .then((res) => {
        setNotifications(res.items);
        setTotal(res.total);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markAllRead() {
    await api('/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function handleClick(n: NotificationItem) {
    api(`/notifications/${n.id}/read`, { method: 'PATCH' }).catch(() => {});
    const meta = n.metadata as Record<string, string>;
    if (n.type.startsWith('verification')) {
      router.push('/dashboard/club');
    } else if (meta.link) {
      router.push(meta.link);
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        </div>

        <Card>
          <CardContent className="p-0 divide-y">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`block w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors ${
                    !n.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total notifications</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => { setPage(page + 1); load(page + 1); }}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
