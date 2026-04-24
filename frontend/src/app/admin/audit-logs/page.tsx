'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { api } from '@/lib/api';

interface AuditLogItem {
  id: string;
  actorUserId: string | null;
  actionType: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function load(p = page) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', '50');
    if (search) params.set('search', search);
    if (entityTypeFilter) params.set('entity_type', entityTypeFilter);

    api<{ items: AuditLogItem[]; total: number }>(`/admin/audit-logs?${params}`)
      .then((res) => {
        setLogs(res.items);
        setTotal(res.total);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleExport() {
    window.open('/admin/audit-logs/export', '_blank');
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Audit Logs</h1>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export CSV
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search actions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={entityTypeFilter} onChange={(e) => setEntityTypeFilter(e.target.value)}>
              <option value="">All entity types</option>
              <option value="user">User</option>
              <option value="verification_request">Verification</option>
              <option value="content_report">Report</option>
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
                    <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium">User</th>
                    <th className="px-4 py-3 text-left font-medium">Action</th>
                    <th className="px-4 py-3 text-left font-medium">Entity</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <>
                      <tr
                        key={l.id}
                        className="border-b cursor-pointer hover:bg-muted/20"
                        onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                      >
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">
                          {l.actorUserId?.slice(0, 8) ?? '—'}
                        </td>
                        <td className="px-4 py-3">{l.actionType}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {l.entityType ?? '—'} {l.entityId ? `(${l.entityId.slice(0, 8)})` : ''}
                        </td>
                      </tr>
                      {expandedId === l.id && (
                        <tr key={`${l.id}-detail`} className="bg-muted/10">
                          <td colSpan={4} className="px-4 py-3">
                            <pre className="text-xs overflow-x-auto">
                              {JSON.stringify(l.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total logs</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => { setPage(page + 1); load(page + 1); }}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
