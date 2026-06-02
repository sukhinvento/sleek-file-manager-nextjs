import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CreditCard, IndianRupee } from 'lucide-react';
import { PaymentRecord, PAYMENT_METHODS } from '@/types/shared';

// Design tokens
const PRIMARY = '#385a9f';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  paidAmount: number;
  onRecordPayment: (payment: PaymentRecord) => Promise<void> | void;
  entityLabel?: string; // e.g. "PO-00012", "SO-00045"
}

export default function RecordPaymentDialog({
  isOpen,
  onClose,
  totalAmount,
  paidAmount,
  onRecordPayment,
  entityLabel,
}: RecordPaymentDialogProps) {
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  const [amount, setAmount] = useState<string>(balanceDue.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (numAmount > balanceDue + 0.01) {
      newErrors.amount = `Amount cannot exceed balance due (${balanceDue.toFixed(2)})`;
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Select a payment method';
    }
    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [amount, paymentMethod, date, balanceDue]);

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onRecordPayment({
        amount: parseFloat(amount),
        paymentMethod: paymentMethod as PaymentRecord['paymentMethod'],
        referenceNumber: referenceNumber || undefined,
        date,
        notes: notes || undefined,
      });
      // Reset & close
      setAmount(balanceDue.toFixed(2));
      setPaymentMethod('Cash');
      setReferenceNumber('');
      setNotes('');
      setErrors({});
      onClose();
    } catch {
      setErrors({ submit: 'Failed to record payment. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const paidPercent = totalAmount > 0 ? Math.min(100, ((paidAmount / totalAmount) * 100)) : 0;
  const newPaidPercent = totalAmount > 0
    ? Math.min(100, (((paidAmount + (parseFloat(amount) || 0)) / totalAmount) * 100))
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: PRIMARY }} />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            {entityLabel ? `Record a payment for ${entityLabel}` : 'Record a payment against this order'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Payment Progress */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Already Paid</span>
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
                {paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Balance Due</span>
              <span className="font-semibold text-amber-600 flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
                {balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${paidPercent}%` }}
              />
              <div
                className="absolute top-0 h-full rounded-full transition-all"
                style={{
                  left: `${paidPercent}%`,
                  width: `${Math.max(0, newPaidPercent - paidPercent)}%`,
                  backgroundColor: PRIMARY,
                  opacity: 0.5,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {paidPercent.toFixed(0)}% paid
              {parseFloat(amount) > 0 && ` → ${newPaidPercent.toFixed(0)}% after this payment`}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-amount">Payment Amount *</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                max={balanceDue}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`pl-9 ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.amount}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label>Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={(v) => {
              setPaymentMethod(v);
              setErrors((prev) => ({ ...prev, paymentMethod: '' }));
            }}>
              <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.paymentMethod}
              </p>
            )}
          </div>

          {/* Reference Number & Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment-ref">Reference / Txn ID</Label>
              <Input
                id="payment-ref"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. TXN-12345"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-date">Date *</Label>
              <Input
                id="payment-date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrors((prev) => ({ ...prev, date: '' }));
                }}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.date}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="payment-notes">Notes</Label>
            <Textarea
              id="payment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this payment..."
              rows={2}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {errors.submit}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || balanceDue <= 0}
              style={{ backgroundColor: PRIMARY }}
              className="text-white hover:opacity-90"
            >
              {saving ? 'Recording...' : `Record Payment`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
