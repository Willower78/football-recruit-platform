'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

const REASONS = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake', label: 'Fake / misleading' },
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'underage_concern', label: 'Underage concern' },
  { value: 'other', label: 'Other' },
];

interface ReportModalProps {
  entityType: string;
  entityId: string;
  onClose: () => void;
}

export function ReportModal({ entityType, entityId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await api('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reported_entity_type: entityType,
          reported_entity_id: entityId,
          reason,
          description: description || undefined,
        }),
      });
      setSubmitted(true);
    } catch {
      // silently handle
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold">Thank you</h3>
          <p className="text-muted-foreground">
            Thank you for reporting. Our team will review this.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg space-y-4">
        <h3 className="text-lg font-semibold">Report content</h3>
        <div className="space-y-2">
          <Label>Reason</Label>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="">Select a reason...</option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Description {reason === 'other' ? '(required)' : '(optional)'}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || (reason === 'other' && !description) || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
