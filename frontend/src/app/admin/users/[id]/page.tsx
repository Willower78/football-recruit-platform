'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

interface UserDetail {
  id: string;
  email: string;
  role: string;
  status: string;
  subscriptionPlan: string;
  createdAt: string;
  lastLoginAt: string | null;
  playerProfile?: Record<string, unknown> | null;
  clubProfile?: Record<string, unknown> | null;
  consents: { id: string; consentType: string; granted: boolean; createdAt: string }[];
  recentAudit: { id: string; actionType: string; createdAt: string; metadata: Record<string, unknown> }[];
}

export default function AdminUserDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspend, setShowSuspend] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    api<UserDetail>(`/admin/users/${params.id}`)
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSuspend() {
    if (!suspendReason) return;
    try {
      await api(`/admin/users/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'suspended', reason: suspendReason }),
      });
      setUser((u) => u ? { ...u, status: 'suspended' } : u);
      setShowSuspend(false);
      setActionMsg('User suspended.');
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  async function handleActivate() {
    try {
      await api(`/admin/users/${params.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'active', reason: 'Reactivated by admin' }),
      });
      setUser((u) => u ? { ...u, status: 'active' } : u);
      setActionMsg('User activated.');
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  async function handleDelete(type: 'soft' | 'gdpr_full') {
    try {
      await api(`/admin/users/${params.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ type }),
      });
      setActionMsg(`User ${type === 'gdpr_full' ? 'permanently deleted' : 'soft-deleted'}.`);
      setTimeout(() => router.push('/admin/users'), 1500);
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  async function handleExport() {
    try {
      const data = await api(`/admin/users/${params.id}/data-export`, { method: 'POST' });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-export-${params.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  if (loading) {
    return (
      <DashboardShell requireRole="admin">
        <Skeleton className="h-64 w-full" />
      </DashboardShell>
    );
  }

  if (!user) {
    return (
      <DashboardShell requireRole="admin">
        <p className="text-destructive">User not found</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-3xl font-semibold">{user.email}</h1>
          <Badge variant="outline" className="capitalize">{user.role}</Badge>
          <Badge variant={user.status === 'active' ? 'success' : 'destructive'} className="capitalize">
            {user.status}
          </Badge>
          <Badge variant="secondary" className="capitalize">{user.subscriptionPlan}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Joined {new Date(user.createdAt).toLocaleDateString()}
          {user.lastLoginAt && ` · Last login ${new Date(user.lastLoginAt).toLocaleDateString()}`}
        </p>

        <div className="flex flex-wrap gap-2">
          {user.status === 'active' ? (
            <Button variant="destructive" size="sm" onClick={() => setShowSuspend(true)}>
              Suspend User
            </Button>
          ) : (
            <Button size="sm" onClick={handleActivate}>Activate User</Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport}>Export Data (GDPR)</Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
            Delete User (GDPR)
          </Button>
        </div>

        {actionMsg && <p className="text-sm text-muted-foreground">{actionMsg}</p>}

        {showSuspend && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>Suspension reason</Label>
              <Textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleSuspend}>Confirm Suspend</Button>
                <Button variant="outline" size="sm" onClick={() => setShowSuspend(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showDelete && (
          <Card className="border-destructive">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">
                Type the user&apos;s email to confirm deletion:
              </p>
              <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteConfirm !== user.email}
                  onClick={() => handleDelete('gdpr_full')}
                >
                  Permanently Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete('soft')}>
                  Soft Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDelete(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="consents">Consents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Profile Data</CardTitle></CardHeader>
              <CardContent>
                {user.playerProfile ? (
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(user.playerProfile, null, 2)}
                  </pre>
                ) : user.clubProfile ? (
                  <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                    {JSON.stringify(user.clubProfile, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No profile data.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                {user.recentAudit.length === 0 ? (
                  <p className="text-muted-foreground">No activity.</p>
                ) : (
                  <div className="space-y-2">
                    {user.recentAudit.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-sm border-b py-2">
                        <span className="font-mono">{a.actionType}</span>
                        <span className="text-muted-foreground">
                          {new Date(a.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consents" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Consent Records</CardTitle></CardHeader>
              <CardContent>
                {user.consents.length === 0 ? (
                  <p className="text-muted-foreground">No consent records.</p>
                ) : (
                  <div className="space-y-2">
                    {user.consents.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm border-b py-2">
                        <span>{c.consentType}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={c.granted ? 'success' : 'destructive'}>
                            {c.granted ? 'Granted' : 'Revoked'}
                          </Badge>
                          <span className="text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
