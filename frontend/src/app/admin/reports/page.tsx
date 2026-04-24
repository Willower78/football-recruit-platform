'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

interface ReportItem {
  id: string;
  reporterUserId: string;
  reportedEntityType: string;
  reportedEntityId: string;
  reason: string;
  description: string | null;
  status: string;
  resolutionNotes: string | null;
  createdAt: string;
  reporter?: { email: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [resolution, setResolution] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  function load(p = page) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', '20');
    if (statusFilter) params.set('status', statusFilter);

    api<{ items: ReportItem[]; total: number }>(`/admin/reports?${params}`)
      .then((res) => {
        setReports(res.items);
        setTotal(res.total);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleAction(status: 'resolved' | 'dismissed') {
    if (!selected) return;
    try {
      await api(`/admin/reports/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolution_notes: resolution || undefined }),
      });
      setActionMsg(`Report ${status}.`);
      setSelected(null);
      setResolution('');
      load();
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Content Reports</h1>

        <div className="flex gap-3 items-end">
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="">All</option>
            </Select>
          </div>
        </div>

        {actionMsg && <p className="text-sm text-muted-foreground">{actionMsg}</p>}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="px-4 py-3 text-left font-medium">Reporter</th>
                      <th className="px-4 py-3 text-left font-medium">Entity Type</th>
                      <th className="px-4 py-3 text-left font-medium">Reason</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        className={`border-b cursor-pointer hover:bg-muted/20 ${
                          selected?.id === r.id ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => setSelected(r)}
                      >
                        <td className="px-4 py-3">{r.reporter?.email ?? r.reporterUserId.slice(0, 8)}</td>
                        <td className="px-4 py-3 capitalize">{r.reportedEntityType}</td>
                        <td className="px-4 py-3 capitalize">{r.reason}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              r.status === 'resolved'
                                ? 'success'
                                : r.status === 'dismissed'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="capitalize"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {selected && (
            <Card>
              <CardHeader>
                <CardTitle>Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p><strong>Reporter:</strong> {selected.reporter?.email ?? selected.reporterUserId}</p>
                  <p><strong>Entity:</strong> {selected.reportedEntityType} ({selected.reportedEntityId.slice(0, 8)}...)</p>
                  <p><strong>Reason:</strong> {selected.reason}</p>
                  {selected.description && <p><strong>Description:</strong> {selected.description}</p>}
                </div>

                {(selected.status === 'pending' || selected.status === 'reviewing') && (
                  <>
                    <div className="space-y-2">
                      <Label>Resolution notes</Label>
                      <Textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => handleAction('resolved')}>
                        Resolve
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => handleAction('dismissed')}>
                        Dismiss
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total reports</span>
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
