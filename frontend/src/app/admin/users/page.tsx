'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';

interface UserItem {
  id: string;
  email: string;
  role: string;
  status: string;
  subscriptionPlan: string;
  createdAt: string;
  playerProfile?: { fullName?: string } | null;
  clubProfile?: { clubName?: string } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function load(p = page) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (statusFilter) params.set('status', statusFilter);

    api<{ items: UserItem[]; total: number }>(`/admin/users?${params}`)
      .then((res) => {
        setUsers(res.items);
        setTotal(res.total);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getName(u: UserItem) {
    return u.playerProfile?.fullName ?? u.clubProfile?.clubName ?? u.email;
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">User Management</h1>

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              <option value="player">Player</option>
              <option value="club">Club</option>
              <option value="scout">Scout</option>
              <option value="admin">Admin</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
            <Button onClick={() => { setPage(1); load(1); }}>Search</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium">Name / Email</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Plan</th>
                    <th className="px-4 py-3 text-left font-medium">Joined</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u.id}`} className="hover:underline font-medium">
                          {getName(u)}
                        </Link>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{u.role}</Badge></td>
                      <td className="px-4 py-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'destructive'} className="capitalize">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3"><Badge variant="secondary" className="capitalize">{u.subscriptionPlan}</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/users/${u.id}`}>View</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total users</span>
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
