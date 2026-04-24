'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { VerificationBadge } from '@/components/verification-badge';
import { api } from '@/lib/api';
import { BadgeCheck, ShieldCheck } from 'lucide-react';

interface ClubProfile {
  id: string;
  clubName: string | null;
  country: string | null;
  city: string | null;
  competitionLevel: string | null;
  verified: boolean;
  verificationTier: string;
  verifiedAt: string | null;
}

interface VerificationStatus {
  verificationTier: string;
  badges: unknown[];
  pendingRequests: { id: string; createdAt: string; verificationMethod: string }[];
}

export default function ClubDashboard() {
  const [profile, setProfile] = useState<ClubProfile | null>(null);
  const [verStatus, setVerStatus] = useState<VerificationStatus | null>(null);
  const [showVerForm, setShowVerForm] = useState(false);
  const [verMethod, setVerMethod] = useState('email_domain');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const [verSubmitting, setVerSubmitting] = useState(false);
  const [verMessage, setVerMessage] = useState('');

  useEffect(() => {
    api<ClubProfile>('/clubs/me').then(setProfile).catch(() => setProfile(null));
    api<VerificationStatus>('/verification/status').then(setVerStatus).catch(() => {});
  }, []);

  async function submitVerificationRequest() {
    if (!profile) return;
    setVerSubmitting(true);
    setVerMessage('');
    try {
      const res = await api<{ id: string; verificationMethod: string }>('/verification/request', {
        method: 'POST',
        body: JSON.stringify({
          entity_type: 'club',
          entity_id: profile.id,
          verification_method: verMethod,
          evidence_notes: evidenceNotes || undefined,
        }),
      });
      if (verMethod === 'email_domain') {
        setPendingRequestId(res.id);
        setVerMessage('A verification code has been sent. Enter the code below.');
      } else {
        setVerMessage('Your verification request has been submitted. We\'ll review it shortly.');
        setShowVerForm(false);
      }
      api<VerificationStatus>('/verification/status').then(setVerStatus).catch(() => {});
    } catch (e) {
      setVerMessage((e as Error).message);
    } finally {
      setVerSubmitting(false);
    }
  }

  async function confirmEmailCode() {
    if (!pendingRequestId) return;
    setVerSubmitting(true);
    try {
      await api('/verification/confirm-email', {
        method: 'POST',
        body: JSON.stringify({ request_id: pendingRequestId, code: emailCode }),
      });
      setVerMessage('Email verified! Your club is now verified.');
      setPendingRequestId(null);
      setShowVerForm(false);
      api<ClubProfile>('/clubs/me').then(setProfile).catch(() => {});
      api<VerificationStatus>('/verification/status').then(setVerStatus).catch(() => {});
    } catch (e) {
      setVerMessage((e as Error).message);
    } finally {
      setVerSubmitting(false);
    }
  }

  const tier = (verStatus?.verificationTier ?? profile?.verificationTier ?? 'unverified') as
    | 'unverified'
    | 'pending'
    | 'verified'
    | 'official';
  const hasPending = (verStatus?.pendingRequests?.length ?? 0) > 0;

  return (
    <DashboardShell requireRole="club">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            {profile?.clubName ?? 'Your club'}
            <VerificationBadge tier={tier} size="md" />
          </h1>
          <p className="text-muted-foreground">
            {profile?.city && profile.country
              ? `${profile.city}, ${profile.country}`
              : 'Set up your club profile to start recruiting.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Level" value={profile?.competitionLevel ?? '—'} />
          <StatCard title="Verification" value={tier} />
          <StatCard title="Active needs" value="0" />
        </div>

        {/* Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={20} />
              Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tier === 'verified' || tier === 'official' ? (
              <div className="flex items-center gap-3">
                <VerificationBadge tier={tier} size="lg" />
                <div>
                  <p className="font-medium">
                    {tier === 'official' ? 'Official Club' : 'Verified Club'}
                  </p>
                  {profile?.verifiedAt && (
                    <p className="text-sm text-muted-foreground">
                      Verified since {new Date(profile.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ) : hasPending ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-800">Verification in progress</p>
                <p className="text-sm text-amber-700">
                  Submitted on{' '}
                  {new Date(verStatus!.pendingRequests[0].createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border bg-muted/30 p-4 space-y-2">
                  <p className="font-medium flex items-center gap-2">
                    <BadgeCheck size={16} className="text-blue-500" />
                    Build trust with players
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verified clubs get 3x more applications. Prove your club is legitimate to
                    stand out.
                  </p>
                  <Button onClick={() => setShowVerForm(true)} size="sm">
                    Get Verified
                  </Button>
                </div>

                {showVerForm && !pendingRequestId && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label>Verification method</Label>
                      <Select value={verMethod} onChange={(e) => setVerMethod(e.target.value)}>
                        <option value="email_domain">Verify via official email</option>
                        <option value="document">Upload documentation</option>
                      </Select>
                    </div>
                    {verMethod === 'document' && (
                      <div className="space-y-2">
                        <Label>Notes (describe document)</Label>
                        <Textarea
                          value={evidenceNotes}
                          onChange={(e) => setEvidenceNotes(e.target.value)}
                          rows={3}
                          placeholder="Describe the document you are uploading (e.g. FA registration certificate)"
                        />
                      </div>
                    )}
                    <Button onClick={submitVerificationRequest} disabled={verSubmitting}>
                      {verSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </div>
                )}

                {pendingRequestId && (
                  <div className="space-y-3 border-t pt-4">
                    <Label>Enter verification code</Label>
                    <div className="flex gap-2">
                      <Input
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value)}
                        placeholder="6-digit code"
                        maxLength={6}
                      />
                      <Button onClick={confirmEmailCode} disabled={verSubmitting || emailCode.length < 6}>
                        Verify
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {verMessage && (
              <p className="text-sm text-muted-foreground">{verMessage}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/search">Discover players</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/onboarding/club">Update profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold capitalize">{value}</p>
      </CardContent>
    </Card>
  );
}
