/**
 * AbdmSheet — ABDM / ABHA integration overlay
 *
 * Modes:
 *   create  → Aadhaar OTP flow (2 steps) to create a new ABHA
 *   link    → Enter existing ABHA number → verify OTP → link
 *   view    → Show linked ABHA card with QR code
 *
 * Usage:
 *   <AbdmSheet
 *     isOpen={isOpen}
 *     onClose={() => setIsOpen(false)}
 *     patientId="PAT-1005"
 *     patientName="Ananya Patel"
 *     initialMode="create"          // or "link" | "view"
 *     onLinked={(profile) => ...}   // called when ABHA is successfully linked
 *   />
 */

import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  X, ShieldCheck, Smartphone, CheckCircle, AlertCircle,
  QrCode, Link2, RefreshCw, ChevronRight, Loader2,
  IndianRupee, ExternalLink,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import * as abdmService from '@/services/abdmService';
import type { AbhaProfile } from '@/services/abdmService';

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = 'choose' | 'create-aadhaar' | 'create-otp' | 'link-abha' | 'link-otp' | 'success';

interface AbdmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  initialMode?: 'choose' | 'link' | 'view';
  existingProfile?: AbhaProfile | null;
  onLinked?: (profile: AbhaProfile) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const OTP_HINT = 'Use 123456 as test OTP';

// Simple mock QR as SVG placeholder
const MockQr = ({ value }: { value: string }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-36 h-36 bg-white border-2 border-border rounded-xl flex items-center justify-center p-2">
      <QrCode className="w-full h-full text-foreground opacity-80" />
    </div>
    <p className="text-[10px] text-muted-foreground font-mono text-center break-all max-w-[140px]">{value}</p>
  </div>
);

// ABHA card display
const AbhaCard = ({ profile }: { profile: AbhaProfile }) => (
  <div className="rounded-2xl overflow-hidden border border-primary/30 shadow-lg">
    {/* Header band */}
    <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">ABDM · ABHA</p>
        <p className="text-xs font-semibold text-white mt-0.5">Ayushman Bharat Health Account</p>
      </div>
      <ShieldCheck className="h-6 w-6 text-white/80" />
    </div>
    {/* Body */}
    <div className="bg-card px-4 py-4 flex items-center gap-4">
      <MockQr value={profile.abhaNumber} />
      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ABHA Number</p>
          <p className="text-lg font-black text-primary font-mono tracking-wide leading-tight">{profile.abhaNumber}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ABHA Address</p>
          <p className="text-xs font-semibold text-foreground">{profile.abhaAddress}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</p>
          <p className="text-sm font-bold text-foreground">{profile.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px] pointer-events-none gap-1">
            <CheckCircle className="h-2.5 w-2.5" /> Linked
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {profile.linkedAt ? new Date(profile.linkedAt).toLocaleDateString('en-IN') : ''}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// ── Section card ────────────────────────────────────────────────────────────────

const InfoBox = ({ icon: Icon, title, children, variant = 'default' }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning';
}) => {
  const cls = {
    default: 'bg-primary/5 border-primary/20',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
  }[variant];
  const iconCls = { default: 'text-primary', success: 'text-green-600', warning: 'text-amber-600' }[variant];
  return (
    <div className={`rounded-xl border px-4 py-3.5 flex items-start gap-3 ${cls}`}>
      <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconCls}`} />
      <div className="space-y-0.5">
        <p className={`text-xs font-semibold ${iconCls}`}>{title}</p>
        <div className="text-xs text-muted-foreground">{children}</div>
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────────

export const AbdmSheet = ({
  isOpen, onClose, patientId, patientName,
  initialMode = 'choose', existingProfile, onLinked,
}: AbdmSheetProps) => {
  const [mode, setMode] = useState<Mode>(existingProfile ? 'success' : initialMode === 'link' ? 'link-abha' : 'choose');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create flow
  const [aadhaar, setAadhaar] = useState('');
  const [createTxn, setCreateTxn] = useState('');
  const [createOtp, setCreateOtp] = useState('');

  // Link flow
  const [abhaInput, setAbhaInput] = useState('');
  const [linkTxn, setLinkTxn] = useState('');
  const [linkOtp, setLinkOtp] = useState('');

  // Result
  const [profile, setProfile] = useState<AbhaProfile | null>(existingProfile ?? null);

  const resetError = () => setError('');

  const handleClose = () => {
    setMode(existingProfile ? 'success' : initialMode === 'link' ? 'link-abha' : 'choose');
    setAadhaar(''); setCreateTxn(''); setCreateOtp('');
    setAbhaInput(''); setLinkTxn(''); setLinkOtp('');
    setError(''); setLoading(false);
    onClose();
  };

  // ── Create flow ──────────────────────────────────────────────────────────────

  const handleSendCreateOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await abdmService.initiateAbhaCreation(aadhaar.replace(/\s/g, ''));
      setCreateTxn(res.txnId);
      setMode('create-otp');
      toast({ title: 'OTP Sent', description: `OTP sent to ${res.maskedMobile}` });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleVerifyCreateOtp = async () => {
    setLoading(true); setError('');
    try {
      const p = await abdmService.createAbha(createTxn, createOtp, patientName);
      abdmService.saveAbhaToPatient(patientId, p);
      setProfile(p);
      setMode('success');
      onLinked?.(p);
      toast({ title: 'ABHA Created!', description: `Your ABHA number is ${p.abhaNumber}`, variant: 'success' });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  // ── Link flow ────────────────────────────────────────────────────────────────

  const handleSendLinkOtp = async () => {
    setLoading(true); setError('');
    try {
      // First verify the ABHA exists
      await abdmService.verifyAbha(abhaInput);
      const res = await abdmService.initiateAbhaLink(abhaInput);
      setLinkTxn(res.txnId);
      setMode('link-otp');
      toast({ title: 'OTP Sent', description: `OTP sent to ABHA-registered mobile ${res.maskedMobile}` });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  const handleVerifyLinkOtp = async () => {
    setLoading(true); setError('');
    try {
      await abdmService.confirmAbhaLink(linkTxn, linkOtp);
      const p = await abdmService.verifyAbha(abhaInput);
      const linked = { ...p, name: patientName, linkedAt: new Date().toISOString(), patientId };
      abdmService.saveAbhaToPatient(patientId, linked);
      setProfile(linked);
      setMode('success');
      onLinked?.(linked);
      toast({ title: 'ABHA Linked!', description: `${abhaInput} linked to patient.`, variant: 'success' });
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  // ── Header ───────────────────────────────────────────────────────────────────

  const headerMeta: Record<Mode, { title: string; subtitle: string }> = {
    'choose':          { title: 'ABDM / ABHA',             subtitle: 'Ayushman Bharat Digital Mission' },
    'create-aadhaar':  { title: 'Create ABHA',             subtitle: 'Verify with Aadhaar OTP' },
    'create-otp':      { title: 'Verify OTP',              subtitle: 'Enter the OTP sent to your mobile' },
    'link-abha':       { title: 'Link Existing ABHA',      subtitle: 'Connect an existing ABHA account' },
    'link-otp':        { title: 'Confirm Linking',         subtitle: 'Enter the OTP sent to ABHA mobile' },
    'success':         { title: 'ABHA Linked',             subtitle: patientName },
  };
  const { title, subtitle } = headerMeta[mode];

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col h-full bg-background">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* ── Choose mode ─────────────────────────────────────────── */}
          {mode === 'choose' && (
            <div className="space-y-4">
              <InfoBox icon={ShieldCheck} title="What is ABHA?">
                ABHA (Ayushman Bharat Health Account) is a unique 14-digit health ID issued under India's national digital health mission. It enables patients to link, access, and share their health records digitally across hospitals.
              </InfoBox>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose an option</p>

              <button
                onClick={() => setMode('create-aadhaar')}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Create new ABHA</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Generate a new ABHA using Aadhaar OTP verification</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => setMode('link-abha')}
                className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Link existing ABHA</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enter an existing ABHA number or address to link</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <InfoBox icon={AlertCircle} title="Mock mode active" variant="warning">
                All ABDM API calls are simulated. Use OTP <span className="font-mono font-bold">123456</span> and any 12-digit Aadhaar number.
              </InfoBox>
            </div>
          )}

          {/* ── Create: Step 1 — Aadhaar ────────────────────────────── */}
          {mode === 'create-aadhaar' && (
            <div className="space-y-5">
              <InfoBox icon={ShieldCheck} title="Aadhaar-based ABHA creation">
                An OTP will be sent to the mobile number registered with your Aadhaar. No Aadhaar data is stored by MedSystem.
              </InfoBox>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Aadhaar Number <span className="text-destructive">*</span></Label>
                <Input
                  value={aadhaar}
                  onChange={e => { setAadhaar(e.target.value); resetError(); }}
                  placeholder="1234 5678 9012"
                  maxLength={14}
                  className="h-10 font-mono tracking-widest text-center text-lg"
                />
                <p className="text-[11px] text-muted-foreground">Enter the 12-digit Aadhaar number (spaces allowed)</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <InfoBox icon={AlertCircle} title="Testing" variant="warning">
                Use any 12-digit number. OTP will always be <span className="font-mono font-bold">123456</span>.
              </InfoBox>
            </div>
          )}

          {/* ── Create: Step 2 — OTP ────────────────────────────────── */}
          {mode === 'create-otp' && (
            <div className="space-y-5">
              <InfoBox icon={Smartphone} title="OTP sent" variant="success">
                A 6-digit OTP has been sent to your Aadhaar-registered mobile. Enter it below to create your ABHA.
              </InfoBox>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Enter OTP <span className="text-destructive">*</span></Label>
                <Input
                  value={createOtp}
                  onChange={e => { setCreateOtp(e.target.value); resetError(); }}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="h-12 font-mono tracking-[0.5em] text-center text-2xl"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">{OTP_HINT}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button onClick={() => setMode('create-aadhaar')} className="text-xs text-primary hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Resend OTP
              </button>
            </div>
          )}

          {/* ── Link: Step 1 — Enter ABHA ───────────────────────────── */}
          {mode === 'link-abha' && (
            <div className="space-y-5">
              <InfoBox icon={Link2} title="Link existing ABHA">
                Enter your patient's existing ABHA number or address. An OTP will be sent to their registered mobile to confirm the link.
              </InfoBox>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ABHA Number or Address <span className="text-destructive">*</span></Label>
                <Input
                  value={abhaInput}
                  onChange={e => { setAbhaInput(e.target.value); resetError(); }}
                  placeholder="43-1234-5678-1234  or  name@abdm"
                  className="h-10 font-mono"
                />
                <p className="text-[11px] text-muted-foreground">Format: XX-XXXX-XXXX-XXXX or name@abdm</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <InfoBox icon={AlertCircle} title="Testing" variant="warning">
                Use any valid format (e.g. <span className="font-mono">43-1234-5678-1234</span> or <span className="font-mono">test@abdm</span>). OTP = <span className="font-mono font-bold">123456</span>.
              </InfoBox>
            </div>
          )}

          {/* ── Link: Step 2 — OTP ──────────────────────────────────── */}
          {mode === 'link-otp' && (
            <div className="space-y-5">
              <InfoBox icon={Smartphone} title="OTP sent to ABHA mobile" variant="success">
                An OTP has been sent to the mobile number registered with ABHA <span className="font-mono font-semibold">{abhaInput}</span>.
              </InfoBox>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Enter OTP <span className="text-destructive">*</span></Label>
                <Input
                  value={linkOtp}
                  onChange={e => { setLinkOtp(e.target.value); resetError(); }}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="h-12 font-mono tracking-[0.5em] text-center text-2xl"
                  autoFocus
                />
                <p className="text-[11px] text-muted-foreground">{OTP_HINT}</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Success ──────────────────────────────────────────────── */}
          {mode === 'success' && profile && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <p className="text-sm font-bold text-foreground">ABHA Linked Successfully</p>
                <p className="text-xs text-muted-foreground text-center">
                  {patientName}'s health records can now be accessed digitally via ABDM.
                </p>
              </div>

              <AbhaCard profile={profile} />

              <InfoBox icon={ShieldCheck} title="Health record sharing enabled">
                Discharge summaries, prescriptions, and diagnostic reports from this visit can now be shared via ABDM with patient consent.
              </InfoBox>

              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ABHA Details</p>
                {[
                  ['ABHA Number', profile.abhaNumber],
                  ['ABHA Address', profile.abhaAddress],
                  ['Mobile', profile.mobile],
                  ['Linked On', profile.linkedAt ? new Date(profile.linkedAt).toLocaleString('en-IN') : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground font-mono">{value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => abdmService.pushHealthRecord(profile.abhaNumber, 'OPDischargeRecord', patientId).then(() =>
                  toast({ title: 'Record Pushed', description: 'Health record shared via ABDM', variant: 'success' })
                )}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm font-semibold py-3 hover:bg-primary/10 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Push Health Record to ABHA
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-card/50 flex-shrink-0">
          {/* Back / Cancel */}
          <Button variant="outline" size="sm" className="min-w-20"
            onClick={() => {
              if (mode === 'choose' || mode === 'success') handleClose();
              else if (mode === 'create-aadhaar' || mode === 'link-abha') setMode('choose');
              else if (mode === 'create-otp') setMode('create-aadhaar');
              else if (mode === 'link-otp') setMode('link-abha');
            }}>
            {mode === 'choose' || mode === 'success' ? <><X className="h-3.5 w-3.5 mr-1" />Close</> : 'Back'}
          </Button>

          <span className="text-[10px] text-muted-foreground">
            {mode !== 'choose' && mode !== 'success' && 'ABDM Sandbox — Mock Mode'}
          </span>

          {/* Primary action */}
          {mode === 'create-aadhaar' && (
            <Button size="sm" className="min-w-32 gap-1.5"
              disabled={aadhaar.replace(/\s/g, '').length < 12 || loading}
              onClick={handleSendCreateOtp}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />}
              Send OTP
            </Button>
          )}
          {mode === 'create-otp' && (
            <Button size="sm" className="min-w-32 gap-1.5"
              disabled={createOtp.length < 6 || loading}
              onClick={handleVerifyCreateOtp}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Create ABHA
            </Button>
          )}
          {mode === 'link-abha' && (
            <Button size="sm" className="min-w-32 gap-1.5"
              disabled={abhaInput.length < 5 || loading}
              onClick={handleSendLinkOtp}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />}
              Send OTP
            </Button>
          )}
          {mode === 'link-otp' && (
            <Button size="sm" className="min-w-32 gap-1.5"
              disabled={linkOtp.length < 6 || loading}
              onClick={handleVerifyLinkOtp}>
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2 className="h-3.5 w-3.5" />}
              Link ABHA
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
