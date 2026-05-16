import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Search, Filter, BedDouble, Wrench, CheckCircle, AlertTriangle,
  Plus, Eye, Edit, X, Save, Wifi, Tv, Wind, Droplets, Zap, Star
} from 'lucide-react';
import * as roomService from '@/services/roomService';
import { Room } from '@/services/roomService';
import { toast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROOM_TYPES: Room['type'][] = ['General', 'Semi-Private', 'Private', 'ICU', 'Deluxe', 'Suite'];
const STATUSES: Room['status'][] = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
const DEPARTMENTS = ['General Medicine', 'Cardiology', 'Orthopaedics', 'Neurology', 'Paediatrics', 'Oncology', 'ICU', 'Maternity', 'Emergency', 'VIP'];
const AMENITIES_LIST = ['AC', 'TV', 'Smart TV', 'Wi-Fi', 'Private Bathroom', 'Shared Bathroom', 'Refrigerator', 'Microwave', 'Sofa', 'Living Area', 'Kitchen', 'Butler Service', 'Ventilator', 'Monitoring Equipment', 'ICU Bed', 'Wheelchair Access', 'Call Bell'];

const STATUS_STYLES: Record<Room['status'], string> = {
  Available:   'bg-green-100 text-green-800 border-green-200',
  Occupied:    'bg-blue-100 text-blue-800 border-blue-200',
  Maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
  Reserved:    'bg-purple-100 text-purple-800 border-purple-200',
};

const TYPE_STYLES: Record<Room['type'], string> = {
  General:      'bg-slate-100 text-slate-700',
  'Semi-Private': 'bg-violet-100 text-violet-700',
  Private:      'bg-green-100 text-green-700',
  ICU:          'bg-red-100 text-red-700',
  Deluxe:       'bg-amber-100 text-amber-700',
  Suite:        'bg-pink-100 text-pink-700',
};

const AMENITY_ICONS: Record<string, React.ElementType> = {
  'Wi-Fi': Wifi,
  'TV': Tv,
  'Smart TV': Tv,
  'AC': Wind,
  'Private Bathroom': Droplets,
  'Shared Bathroom': Droplets,
  'Ventilator': Zap,
};

const ROOM_TYPE_GRADIENT: Record<Room['type'], string> = {
  'General':      'from-slate-500 via-slate-600 to-slate-700',
  'Semi-Private': 'from-teal-500 via-teal-600 to-cyan-700',
  'Private':      'from-emerald-500 via-emerald-600 to-green-700',
  'ICU':          'from-red-500 via-red-600 to-rose-700',
  'Deluxe':       'from-amber-400 via-amber-500 to-orange-500',
  'Suite':        'from-pink-400 via-pink-500 to-rose-600',
};

const RoomTypeHeader = ({ type, status }: { type: Room['type']; status: Room['status'] }) => {
  const statusDot = status === 'Available' ? '#86efac' : status === 'Occupied' ? '#93c5fd' : status === 'Maintenance' ? '#fcd34d' : '#c4b5fd';

  const illustration = () => {
    if (type === 'ICU') return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        <polyline points="15,36 42,36 55,14 65,58 75,36 105,36 115,24 125,48 135,36 188,36"
          stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="156" y="14" width="5" height="22" rx="2.5" fill="rgba(255,255,255,0.4)"/>
        <rect x="147" y="23" width="22" height="5" rx="2.5" fill="rgba(255,255,255,0.4)"/>
        <circle cx="169" cy="57" r="4" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
      </svg>
    );
    if (type === 'Suite') return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        <path d="M80,50 L80,24 L95,38 L100,20 L105,38 L120,24 L120,50 Z"
          fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="80" cy="24" r="4" fill="rgba(255,255,255,0.55)"/>
        <circle cx="100" cy="19" r="4.5" fill="rgba(255,255,255,0.6)"/>
        <circle cx="120" cy="24" r="4" fill="rgba(255,255,255,0.55)"/>
        <path d="M72,50 L128,50" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round"/>
        <text x="28" y="30" fontSize="11" fill="rgba(255,255,255,0.45)">✦</text>
        <text x="153" y="34" fontSize="9" fill="rgba(255,255,255,0.4)">✦</text>
        <text x="38" y="56" fontSize="8" fill="rgba(255,255,255,0.3)">✦</text>
        <text x="148" y="56" fontSize="7" fill="rgba(255,255,255,0.25)">✦</text>
      </svg>
    );
    if (type === 'Deluxe') return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        <rect x="38" y="30" width="124" height="28" rx="5" fill="rgba(255,255,255,0.25)"/>
        <rect x="36" y="17" width="13" height="41" rx="4" fill="rgba(255,255,255,0.35)"/>
        <circle cx="42" cy="21" r="4.5" fill="rgba(255,255,255,0.5)"/>
        <rect x="53" y="32" width="36" height="16" rx="4" fill="rgba(255,255,255,0.4)"/>
        <rect x="95" y="32" width="36" height="16" rx="4" fill="rgba(255,255,255,0.4)"/>
        <rect x="38" y="58" width="5" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
        <rect x="157" y="58" width="5" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
        <text x="152" y="24" fontSize="13" fill="rgba(255,255,255,0.5)">✦</text>
        <text x="22" y="50" fontSize="9" fill="rgba(255,255,255,0.3)">✦</text>
        <text x="172" y="50" fontSize="8" fill="rgba(255,255,255,0.25)">✦</text>
      </svg>
    );
    if (type === 'Private') return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        <rect x="28" y="31" width="144" height="27" rx="5" fill="rgba(255,255,255,0.25)"/>
        <rect x="26" y="18" width="14" height="40" rx="4" fill="rgba(255,255,255,0.35)"/>
        <rect x="46" y="33" width="40" height="15" rx="4" fill="rgba(255,255,255,0.4)"/>
        <rect x="92" y="33" width="40" height="15" rx="4" fill="rgba(255,255,255,0.4)"/>
        <rect x="28" y="58" width="5" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
        <rect x="167" y="58" width="5" height="8" rx="2" fill="rgba(255,255,255,0.2)"/>
        <line x1="174" y1="10" x2="174" y2="68" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4,3"/>
      </svg>
    );
    if (type === 'Semi-Private') return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        {([14, 106] as number[]).map((x, i) => (
          <g key={i}>
            <rect x={x} y="32" width="80" height="25" rx="4" fill="rgba(255,255,255,0.25)"/>
            <rect x={x} y="20" width="11" height="37" rx="3" fill="rgba(255,255,255,0.35)"/>
            <rect x={x + 14} y="34" width="26" height="13" rx="3" fill="rgba(255,255,255,0.4)"/>
            <rect x={x} y="57" width="4" height="7" rx="2" fill="rgba(255,255,255,0.18)"/>
            <rect x={x + 76} y="57" width="4" height="7" rx="2" fill="rgba(255,255,255,0.18)"/>
          </g>
        ))}
        <line x1="100" y1="10" x2="100" y2="68" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" strokeDasharray="5,3"/>
      </svg>
    );
    // General — 3 beds
    return (
      <svg viewBox="0 0 200 72" fill="none" className="w-full h-full">
        {([10, 72, 134] as number[]).map((x, i) => (
          <g key={i}>
            <rect x={x} y="34" width="54" height="22" rx="3" fill="rgba(255,255,255,0.22)"/>
            <rect x={x} y="22" width="9" height="14" rx="2" fill="rgba(255,255,255,0.32)"/>
            <rect x={x + 11} y="35" width="20" height="11" rx="2" fill="rgba(255,255,255,0.38)"/>
            <rect x={x} y="56" width="4" height="7" rx="2" fill="rgba(255,255,255,0.16)"/>
            <rect x={x + 50} y="56" width="4" height="7" rx="2" fill="rgba(255,255,255,0.16)"/>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className={`relative h-[76px] bg-gradient-to-r ${ROOM_TYPE_GRADIENT[type]} overflow-hidden`}>
      {illustration()}
      <div className="absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(circle at 15% 85%, rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute bottom-2 left-3">
        <span className="text-[9px] font-bold text-white/70 uppercase tracking-[0.15em]">{type}</span>
      </div>
      <div className="absolute top-2.5 right-2.5">
        <div className="w-2 h-2 rounded-full" style={{ background: statusDot, boxShadow: `0 0 0 2px rgba(255,255,255,0.25)` }} />
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusPill = ({ status }: { status: Room['status'] }) => (
  <Badge className={`${STATUS_STYLES[status]} border text-xs font-semibold pointer-events-none`}>{status}</Badge>
);

const OccupancyBar = ({ occupied, total }: { occupied: number; total: number }) => {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-green-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-12 text-right">{occupied}/{total} beds</span>
    </div>
  );
};

const FieldGroup = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div>
    <label className="block text-xs font-semibold text-foreground mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const SelectField = ({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Room Detail / Edit Sheet ─────────────────────────────────────────────────

interface RoomSheetProps {
  room: Room | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (room: Room) => void;
}

const EMPTY_ROOM: Omit<Room, 'id'> = {
  roomNumber: '', floor: 1, type: 'General', status: 'Available',
  bedCapacity: 1, occupiedBeds: 0, dailyRate: 0, amenities: [], department: 'General Medicine',
};

const RoomSheet = ({ room, mode, onClose, onSave }: RoomSheetProps) => {
  const [form, setForm] = useState<Omit<Room, 'id'>>(room ? { ...room } : { ...EMPTY_ROOM });
  const [saving, setSaving] = useState(false);
  const isEdit = mode === 'edit' || mode === 'add';

  useEffect(() => {
    setForm(room ? { ...room } : { ...EMPTY_ROOM });
  }, [room]);

  const toggleAmenity = (a: string) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a],
    }));
  };

  const handleSave = async () => {
    if (!form.roomNumber || !form.dailyRate) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Room number and daily rate are required.' });
      return;
    }
    setSaving(true);
    try {
      let saved: Room;
      if (mode === 'add') {
        saved = await roomService.addRoom(form);
        toast({ title: 'Room Added', description: `Room ${saved.roomNumber} has been added.` });
      } else {
        saved = await roomService.updateRoom(room!.id, form);
        toast({ title: 'Room Updated', description: `Room ${saved.roomNumber} has been updated.` });
      }
      onSave(saved);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save room. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!room || mode === 'add'} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] p-0 flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {mode === 'add' ? 'Add New Room' : mode === 'edit' ? `Edit Room ${room?.roomNumber}` : `Room ${room?.roomNumber}`}
            </h2>
            {mode === 'view' && room && (
              <p className="text-xs text-muted-foreground mt-0.5">{room.department} · Floor {room.floor}</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* View Mode */}
          {mode === 'view' && room && (
            <>
              {/* Status + Type */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill status={room.status} />
                <Badge className={`${TYPE_STYLES[room.type]} border-0 text-xs pointer-events-none`}>{room.type}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">₹{room.dailyRate.toLocaleString('en-IN')}/day</span>
              </div>

              {/* Occupancy */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Occupancy</p>
                <OccupancyBar occupied={room.occupiedBeds} total={room.bedCapacity} />
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Capacity', val: room.bedCapacity },
                    { label: 'Occupied', val: room.occupiedBeds },
                    { label: 'Available', val: room.bedCapacity - room.occupiedBeds },
                  ].map(s => (
                    <div key={s.label} className="rounded-md bg-background p-2">
                      <p className="text-lg font-bold text-foreground">{s.val}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="rounded-lg border border-border overflow-hidden">
                {[
                  ['Room Number', room.roomNumber],
                  ['Floor', `Floor ${room.floor}`],
                  ['Department', room.department],
                  ['Type', room.type],
                  ['Daily Rate', `₹${room.dailyRate.toLocaleString('en-IN')}`],
                  ['Status', room.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex px-4 py-2.5 border-b border-border last:border-0 odd:bg-muted/20">
                    <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Amenities */}
              {room.amenities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map(a => {
                      const Icon = AMENITY_ICONS[a];
                      return (
                        <div key={a} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15">
                          {Icon && <Icon className="h-3 w-3 text-primary" />}
                          <span className="text-xs text-primary font-medium">{a}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Maintenance note */}
              {room.status === 'Maintenance' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
                  <Wrench className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    This room is currently under maintenance and is not visible to patients for booking.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Edit / Add Mode */}
          {isEdit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Room Number" required>
                  <Input value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} placeholder="101" />
                </FieldGroup>
                <FieldGroup label="Floor" required>
                  <Input type="number" min={1} max={20} value={form.floor} onChange={e => setForm(p => ({ ...p, floor: Number(e.target.value) }))} />
                </FieldGroup>
                <FieldGroup label="Room Type" required>
                  <SelectField value={form.type} onChange={v => setForm(p => ({ ...p, type: v as Room['type'] }))}
                    options={ROOM_TYPES.map(t => ({ value: t, label: t }))} />
                </FieldGroup>
                <FieldGroup label="Department" required>
                  <SelectField value={form.department} onChange={v => setForm(p => ({ ...p, department: v }))}
                    options={DEPARTMENTS.map(d => ({ value: d, label: d }))} />
                </FieldGroup>
                <FieldGroup label="Bed Capacity" required>
                  <Input type="number" min={1} max={20} value={form.bedCapacity} onChange={e => setForm(p => ({ ...p, bedCapacity: Number(e.target.value) }))} />
                </FieldGroup>
                <FieldGroup label="Daily Rate (₹)" required>
                  <Input type="number" min={0} value={form.dailyRate} onChange={e => setForm(p => ({ ...p, dailyRate: Number(e.target.value) }))} placeholder="2000" />
                </FieldGroup>
              </div>

              <FieldGroup label="Status">
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left transition-all ${
                        form.status === s
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {s}
                      {s === 'Maintenance' && <p className="text-[10px] font-normal mt-0.5 opacity-70">Hidden from booking</p>}
                      {s === 'Reserved' && <p className="text-[10px] font-normal mt-0.5 opacity-70">Pre-allocated</p>}
                      {s === 'Available' && <p className="text-[10px] font-normal mt-0.5 opacity-70">Open for booking</p>}
                      {s === 'Occupied' && <p className="text-[10px] font-normal mt-0.5 opacity-70">Has active patients</p>}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(a => {
                    const active = form.amenities.includes(a);
                    const Icon = AMENITY_ICONS[a];
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                          active ? 'border-primary bg-primary/8 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.status === 'Maintenance' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Setting status to Maintenance will hide this room from the patient admission room-booking step until restored.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {isEdit && (
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <>Saving…</> : <><Save className="h-4 w-4" /> Save Room</>}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRooms: 0, availableRooms: 0, occupiedRooms: 0, maintenanceRooms: 0, totalBeds: 0, occupiedBeds: 0, occupancyRate: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [sheetMode, setSheetMode] = useState<'view' | 'edit' | 'add' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomData, statsData] = await Promise.all([roomService.fetchRooms(), roomService.getRoomStats()]);
      setRooms(roomData);
      setStats(statsData);
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load room data.' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => rooms.filter(r => {
    const matchSearch = !searchTerm ||
      r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchType = filterType === 'All' || r.type === filterType;
    return matchSearch && matchStatus && matchType;
  }), [rooms, searchTerm, filterStatus, filterType]);

  const handleStatusToggle = (status: string) => setFilterStatus(s => s === status ? 'All' : status);

  const handleSave = (saved: Room) => {
    setRooms(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      return idx >= 0 ? prev.map(r => r.id === saved.id ? saved : r) : [...prev, saved];
    });
    roomService.getRoomStats().then(setStats);
    setSheetMode(null);
    setSelectedRoom(null);
  };

  const handleQuickStatus = async (room: Room, status: Room['status']) => {
    try {
      const updated = await roomService.updateRoom(room.id, { status });
      setRooms(prev => prev.map(r => r.id === updated.id ? updated : r));
      roomService.getRoomStats().then(setStats);
      toast({ title: 'Status Updated', description: `Room ${room.roomNumber} is now ${status}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' });
    }
  };

  const statusCards = [
    { label: 'Total Rooms', value: stats.totalRooms, status: 'All', color: 'text-primary', bg: 'from-primary/5 to-primary/10', icon: BedDouble },
    { label: 'Available', value: stats.availableRooms, status: 'Available', color: 'text-green-600', bg: 'from-green-50 to-lime-50', icon: CheckCircle },
    { label: 'Occupied', value: stats.occupiedRooms, status: 'Occupied', color: 'text-blue-600', bg: 'from-blue-50 to-indigo-50', icon: BedDouble },
    { label: 'Maintenance', value: stats.maintenanceRooms, status: 'Maintenance', color: 'text-amber-600', bg: 'from-amber-50 to-orange-50', icon: Wrench },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <section className="bg-card sm:mx-0">
        <div className="stat-cards-scroll">
          <div className="flex flex-nowrap gap-3 sm:gap-4 w-max">
            {statusCards.map(card => (
              <Card
                key={card.status}
                onClick={() => handleStatusToggle(card.status)}
                className={`flex-shrink-0 w-40 sm:w-44 md:w-48 shadow-lg border-none bg-gradient-to-br ${card.bg} relative overflow-hidden stat-card-clickable ${filterStatus === card.status ? 'stat-card-active' : ''}`}
                title={card.status === 'All' ? 'Show all rooms' : `Filter by ${card.status}`}
              >
                <CardContent className="p-3 relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${card.color}`}>{card.label}</p>
                      <p className={`text-2xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <card.icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </div>
                  {card.status === 'All' && (
                    <p className="text-xs text-muted-foreground">{stats.occupancyRate}% occupancy</p>
                  )}
                  {card.status === 'Available' && (
                    <p className="text-xs text-green-600">{stats.totalBeds - stats.occupiedBeds} beds free</p>
                  )}
                  {card.status === 'Occupied' && (
                    <p className="text-xs text-blue-600">{stats.occupiedBeds} of {stats.totalBeds} beds</p>
                  )}
                  {card.status === 'Maintenance' && (
                    <p className="text-xs text-amber-600">Hidden from booking</p>
                  )}
                </CardContent>
                <card.icon className={`absolute bottom-0 right-0 h-12 w-12 opacity-[0.05] transform translate-x-3 translate-y-3 ${card.color}`} />
              </Card>
            ))}

            {/* Occupancy Rate Card */}
            <Card className="flex-shrink-0 w-40 sm:w-44 md:w-48 shadow-lg border-none bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 relative overflow-hidden">
              <CardContent className="p-3 relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">Bed Occupancy</p>
                <p className="text-2xl font-bold text-purple-700">{stats.occupancyRate}%</p>
                <div className="mt-2 w-full bg-purple-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${stats.occupancyRate}%` }} />
                </div>
                <p className="text-xs text-purple-600 mt-1">{stats.occupiedBeds}/{stats.totalBeds} beds in use</p>
              </CardContent>
              <BedDouble className="absolute bottom-0 right-0 h-12 w-12 text-purple-500/5 transform translate-x-3 translate-y-3" />
            </Card>
          </div>
        </div>
      </section>

      {/* Active filter indicator */}

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-4 sm:mx-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Type filter pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {['All', ...ROOM_TYPES].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-shrink-0 px-3 h-8 rounded-full text-xs font-semibold transition-colors border ${
                  filterType === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex gap-2 lg:ml-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Room number, department…"
                className="pl-8 h-9 text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => { setSelectedRoom(null); setSheetMode('add'); }} className="gap-2 flex-shrink-0">
              <Plus className="h-4 w-4" /> Add Room
            </Button>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BedDouble className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No rooms found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(room => {
            const freeBeds = room.bedCapacity - room.occupiedBeds;
            const isMaintenance = room.status === 'Maintenance';
            return (
              <Card key={room.id} className={`border shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden ${isMaintenance ? 'opacity-75' : ''}`}>
                <RoomTypeHeader type={room.type} status={room.status} />
                <CardContent className="p-4 space-y-3">
                  {/* Header row */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Room {room.roomNumber}</span>
                        {isMaintenance && <Wrench className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                      <p className="text-xs text-foreground/60 mt-0.5">Fl {room.floor} · {room.department}</p>
                    </div>
                    <StatusPill status={room.status} />
                  </div>

                  {/* Type badge + rate */}
                  <div className="flex items-center justify-between">
                    <Badge className={`${TYPE_STYLES[room.type]} border-0 text-xs pointer-events-none`}>{room.type}</Badge>
                    <span className="text-xs font-semibold text-foreground">₹{room.dailyRate.toLocaleString('en-IN')}<span className="text-muted-foreground font-normal">/day</span></span>
                  </div>

                  {/* Occupancy */}
                  <OccupancyBar occupied={room.occupiedBeds} total={room.bedCapacity} />

                  {/* Amenities preview — single line, no wrap */}
                  {room.amenities.length > 0 && (
                    <div className="flex items-center gap-1 overflow-hidden">
                      {room.amenities.slice(0, 3).map(a => {
                        const Icon = AMENITY_ICONS[a];
                        return (
                          <div key={a} className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] text-foreground/70 flex-shrink-0 whitespace-nowrap">
                            {Icon && <Icon className="h-2.5 w-2.5 flex-shrink-0" />}
                            <span>{a}</span>
                          </div>
                        );
                      })}
                      {room.amenities.length > 3 && (
                        <div className="px-1.5 py-0.5 rounded bg-primary/8 text-[10px] text-primary font-medium flex-shrink-0 whitespace-nowrap">
                          +{room.amenities.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                    <Button
                      variant="ghost" size="sm" className="h-7 px-2 text-xs flex-1"
                      onClick={() => { setSelectedRoom(room); setSheetMode('view'); }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                    <Button
                      variant="ghost" size="sm" className="h-7 px-2 text-xs flex-1"
                      onClick={() => { setSelectedRoom(room); setSheetMode('edit'); }}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    {/* Quick status toggle */}
                    {room.status === 'Available' && (
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => handleQuickStatus(room, 'Maintenance')}
                        title="Mark as Maintenance"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {room.status === 'Maintenance' && (
                      <Button
                        variant="ghost" size="sm"
                        className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleQuickStatus(room, 'Available')}
                        title="Mark as Available"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Room Sheet */}
      {sheetMode && (
        <RoomSheet
          room={sheetMode === 'add' ? null : selectedRoom}
          mode={sheetMode}
          onClose={() => { setSheetMode(null); setSelectedRoom(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
