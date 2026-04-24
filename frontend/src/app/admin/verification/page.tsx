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

interface VerificationRequestItem {
  id: string;
  entityType: string;
  entityId: string;
  verificationMethod: string;
  evidence: Record<string, unknown>;
  status: string;
  createdAt: string;
  user: { id: string; email: string };
  entityData?: Record<string, unknown>;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState<VerificationRequestItem | null>(null);
  const [reviewBadgeType, setReviewBadgeType] = useState<string>('verified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  function load(p = page) {
    const params = new URLSearchParams();
    params.set('page', String(p));
    params.set('limit', '20');
    if (statusFilter) params.set('status', statusFilter);

    api<{ items: VerificationRequestItem[]; total: number }>(
      `/admin/verification/queue?${params}`,
    )
      .then((res) => {
        setRequests(res.items);
        setTotal(res.total);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleSelect(req: VerificationRequestItem) {
    try {
      const detail = await api<VerificationRequestItem>(`/admin/verification/queue/${req.id}`);
      setSelected(detail);
    } catch {
      setSelected(req);
    }
  }

  async function handleApprove() {
    if (!selected) return;
    try {
      await api(`/admin/verification/queue/${selected.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', badge_type: reviewBadgeType }),
      });
      setActionMsg('Approved!');
      setSelected(null);
      load();
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  async function handleReject() {
    if (!selected || !rejectionReason) return;
    try {
      await api(`/admin/verification/queue/${selected.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', rejection_reason: rejectionReason }),
      });
      setActionMsg('Rejected.');
      setSelected(null);
      setRejectionReason('');
      load();
    } catch (e) {
      setActionMsg((e as Error).message);
    }
  }

  return (
    <DashboardShell requireRole="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Verification Queue</h1>

        <div className="flex gap-3 items-end">
          <div>
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                      <th className="px-4 py-3 text-left font-medium">Entity</th>
                      <th className="px-4 py-3 text-left font-medium">Type</th>
                      <th className="px-4 py-3 text-left font-medium">Method</th>
                      <th className="px-4 py-3 text-left font-medium">Submitted</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className={`border-b cursor-pointer hover:bg-muted/20 ${
                          selected?.id === r.id ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleSelect(r)}
                      >
                        <td className="px-4 py-3">{r.user?.email ?? r.entityId}</td>
                        <td className="px-4 py-3 capitalize">{r.entityType}</td>
                        <td className="px-4 py-3">{r.verificationMethod}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              r.status === 'approved'
                                ? 'success'
                                : r.status === 'rejected'
                                  ? 'destructive'
                                  : 'outline'
                            }
                            className="capitalize"
                          >
                            {r.status}
                          </Badge>
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
                <CardTitle>Review Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1 text-sm">
                  <p><strong>Submitter:</strong> {selected.user?.email}</p>
                  <p><strong>Entity:</strong> {selected.entityType} ({selected.entityId.slice(0, 8)}...)</p>
                  <p><strong>Method:</strong> {selected.verificationMethod}</p>
                  {selected.entityData && (
                    <p><strong>Details:</strong> {JSON.stringify(selected.entityData)}</p>
                  )}
                  {selected.evidence && Object.keys(selected.evidence).length > 0 && (
                    <div>
                      <strong>Evidence:</strong>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(selected.evidence, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {selected.status === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <Label>Badge tier (if approving)</Label>
                      <Select
                        value={reviewBadgeType}
                        onChange={(e) => setReviewBadgeType(e.target.value)}
                      >
                        <option value="verified">Verified</option>
                        <option value="official">Official</option>
                      </Select>
                    </div>

                    <Button className="w-full" onClick={handleApprove}>
                      Approve
                    </Button>

                    <div className="space-y-2">
                      <Label>Rejection reason</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={!rejectionReason}
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} total requests</span>
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
