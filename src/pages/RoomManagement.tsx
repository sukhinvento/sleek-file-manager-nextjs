import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Search, BedDouble, Wrench, CheckCircle, AlertTriangle,
  Plus, Eye, Edit, X, Save, Wifi, Tv, Wind, Droplets, Zap, Users
} from 'lucide-react';
import * as roomService from '@/services/roomService';
import { Room } from '@/services/roomService';
import { toast } from '@/hooks/use-toast';
import { StatCard, STAT_ACCENTS } from '@/components/ui/stat-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIMARY   = STAT_ACCENTS.PRIMARY;
const TEXT_MUTE = 'hsl(220,12%,54%)';
const BORDER    = 'hsl(220,16%,90%)';

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

const ROOM_TYPE_PHOTO: Record<Room['type'], string> = {
  'General':      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=200&fit=crop&auto=format',
  'Semi-Private': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=200&fit=crop&auto=format',
  'Private':      'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&h=200&fit=crop&auto=format',
  'ICU':          'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=200&fit=crop&auto=format',
  'Deluxe':       'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=200&fit=crop&auto=format',
  'Suite':        'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=600&h=200&fit=crop&auto=format',
};

const RoomTypeHeader = ({ type, status }: { type: Room['type']; status: Room['status'] }) => {
  const statusDot = status === 'Available' ? '#86efac' : status === 'Occupied' ? '#93c5fd' : status === 'Maintenance' ? '#fcd34d' : '#c4b5fd';

  return (
    <div className="relative h-[76px] overflow-hidden">
      <img
        src={ROOM_TYPE_PHOTO[type]}
        alt={type}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.1) 100%)' }} />
      <div className="absolute bottom-2 left-3">
        <span className="text-[9px] font-bold text-white/90 uppercase tracking-[0.15em] drop-shadow">{type}</span>
      </div>
      <div className="absolute top-2.5 right-2.5">
        <div className="w-2 h-2 rounded-full" style={{ background: statusDot, boxShadow: `0 0 0 2px rgba(255,255,255,0.3)` }} />
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
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-9 text-sm w-full">
      <SelectValue placeholder={placeholder ?? 'Select…'} />
    </SelectTrigger>
    <SelectContent>
      {options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
    </SelectContent>
  </Select>
);

// ─── Room Detail / Edit Sheet ─────────────────────────────────────────────────

interface RoomSheetProps {
  room: Room | null;
  mode: 'view' | 'edit' | 'add';
  onClose: () => void;
  onSave: (room: Room) => void;
  onStatusChange?: (room: Room, status: Room['status']) => void;
}

const EMPTY_ROOM: Omit<Room, 'id'> = {
  roomNumber: '', floor: 1, type: 'General', status: 'Available',
  bedCapacity: 1, occupiedBeds: 0, dailyRate: 0, amenities: [], department: 'General Medicine',
};

const RoomSheet = ({ room, mode, onClose, onSave, onStatusChange }: RoomSheetProps) => {
  const [form, setForm] = useState<Omit<Room, 'id'>>(room ? { ...room } : { ...EMPTY_ROOM });
  const [saving, setSaving] = useState(false);
  const [internalMode, setInternalMode] = useState<'view' | 'edit' | 'add'>(mode);

  useEffect(() => { setInternalMode(mode); }, [mode]);

  const isEdit = internalMode === 'edit' || internalMode === 'add';

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
      toast({ title: 'Missing fields', description: 'Room number and daily rate are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let saved: Room;
      if (mode === 'add') {
        saved = await roomService.addRoom(form);
        toast({ title: 'Room Added', description: `Room ${saved.roomNumber} has been added.`, variant: 'success' });
      } else {
        saved = await roomService.updateRoom(room!.id, form);
        toast({ title: 'Room Updated', description: `Room ${saved.roomNumber} has been updated.`, variant: 'success' });
      }
      onSave(saved);
    } catch {
      toast({ title: 'Error', description: 'Failed to save room. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={!!room || internalMode === 'add'} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] p-0 flex flex-col h-full bg-background">
        {/* Header — title + close only */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground leading-tight break-words">
              {internalMode === 'add' ? 'Add New Room' : internalMode === 'edit' ? `Edit Room ${room?.roomNumber}` : `Room ${room?.roomNumber}`}
            </h2>
            {internalMode === 'view' && room && (
              <p className="text-xs text-muted-foreground mt-0.5">{room.department || room.type} · Floor {room.floor}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors flex-shrink-0">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* View Mode */}
          {internalMode === 'view' && room && (
            <>
              {/* Room photo — half-height, rounded, inside content */}
              <div className="rounded-xl overflow-hidden -mx-6 -mt-5">
                <RoomTypeHeader type={room.type} status={room.status} />
              </div>

              {/* Status + Type + Rate row */}
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill status={room.status} />
                <Badge className={`${TYPE_STYLES[room.type]} border-0 text-xs pointer-events-none`}>{room.type}</Badge>
                <span className="text-xs font-semibold text-foreground ml-auto">₹{room.dailyRate.toLocaleString('en-IN')}<span className="font-normal text-muted-foreground">/day</span></span>
              </div>

              {/* Bed stats — same pattern as Doctor experience/patients/fee */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Capacity', val: room.bedCapacity, icon: BedDouble },
                  { label: 'Occupied', val: room.occupiedBeds, icon: Users },
                  { label: 'Available', val: room.bedCapacity - room.occupiedBeds, icon: CheckCircle },
                ].map(s => (
                  <div key={s.label} className="rounded-lg border border-border bg-card p-3 text-center">
                    <s.icon className="h-4 w-4 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Occupancy progress bar */}
              <OccupancyBar occupied={room.occupiedBeds} total={room.bedCapacity} />

              {/* Room Details section */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <BedDouble className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Room Details</span>
                </div>
                {[
                  { label: 'Room Number', value: room.roomNumber },
                  { label: 'Floor', value: `Floor ${room.floor}` },
                  { label: 'Department', value: room.department || '—' },
                  { label: 'Type', value: room.type },
                  { label: 'Daily Rate', value: `₹${room.dailyRate.toLocaleString('en-IN')}` },
                  { label: 'Status', value: room.status },
                ].map(({ label, value }, i) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-2.5 border-b border-border last:border-0 ${i % 2 === 0 ? 'bg-card' : 'bg-primary/[0.025]'}`}>
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-semibold text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Amenities section */}
              {room.amenities.length > 0 && (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="bg-primary/[0.06] px-4 py-2.5 border-b border-border flex items-center gap-2">
                    <Wifi className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Amenities</span>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-2">
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

              {/* Maintenance alert */}
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

        {/* Footer — CTAs only */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-t border-border bg-card flex-shrink-0">
          {/* View mode — no Close, only action CTAs */}
          {!isEdit && room && (
            <>
              {room.status === 'Available' && onStatusChange && (
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                  onClick={() => { onStatusChange(room, 'Maintenance'); onClose(); }}>
                  <Wrench className="h-3.5 w-3.5" /> Maintenance
                </Button>
              )}
              {room.status === 'Maintenance' && onStatusChange && (
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                  onClick={() => { onStatusChange(room, 'Available'); onClose(); }}>
                  <CheckCircle className="h-3.5 w-3.5" /> Mark Available
                </Button>
              )}
              <Button size="sm" className="h-9 gap-1.5 ml-auto" onClick={() => setInternalMode('edit')}>
                <Edit className="h-4 w-4" /> Edit Room
              </Button>
            </>
          )}
          {/* Edit/Add mode — Cancel + Save */}
          {isEdit && (
            <>
              <Button variant="outline" size="sm" className="h-9" onClick={onClose}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="h-9 gap-2 ml-auto">
                {saving ? <>Saving…</> : <><Save className="h-4 w-4" /> Save Room</>}
              </Button>
            </>
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

  useEffect(() => { loadData(); }, []);

  const computeStats = (roomList: Room[]) => {
    const totalBeds = roomList.reduce((sum, r) => sum + r.bedCapacity, 0);
    const occupiedBeds = roomList.reduce((sum, r) => sum + r.occupiedBeds, 0);
    return {
      totalRooms: roomList.length,
      availableRooms: roomList.filter(r => r.status === 'Available').length,
      occupiedRooms: roomList.filter(r => r.status === 'Occupied').length,
      maintenanceRooms: roomList.filter(r => r.status === 'Maintenance').length,
      totalBeds,
      occupiedBeds,
      occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    };
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const roomData = await roomService.fetchRooms();
      setRooms(roomData);
      setStats(computeStats(roomData));
    } catch {
      toast({ title: 'Error', description: 'Failed to load room data.', variant: 'destructive' });
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
      toast({ title: 'Status Updated', description: `Room ${room.roomNumber} is now ${status}.`, variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="stat-cards-scroll">
        <div className="flex flex-nowrap gap-3 w-max">
          <StatCard label="Total Rooms" value={stats.totalRooms} icon={BedDouble} accent={STAT_ACCENTS.PRIMARY}
            active={filterStatus === 'All'} onClick={() => setFilterStatus('All')} />
          <StatCard label="Available" value={stats.availableRooms} icon={CheckCircle} accent={STAT_ACCENTS.SUCCESS}
            active={filterStatus === 'Available'} onClick={() => setFilterStatus(s => s === 'Available' ? 'All' : 'Available')} />
          <StatCard label="Occupied" value={stats.occupiedRooms} icon={BedDouble} accent={STAT_ACCENTS.CYAN}
            active={filterStatus === 'Occupied'} onClick={() => setFilterStatus(s => s === 'Occupied' ? 'All' : 'Occupied')} />
          <StatCard label="Maintenance" value={stats.maintenanceRooms} icon={Wrench} accent={STAT_ACCENTS.WARNING}
            active={filterStatus === 'Maintenance'} onClick={() => setFilterStatus(s => s === 'Maintenance' ? 'All' : 'Maintenance')} />
          <StatCard label="Total Beds" value={stats.totalBeds} icon={Users} accent={STAT_ACCENTS.PURPLE} />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 bg-card rounded-xl border shadow-sm p-3 overflow-hidden">
        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {['All', ...ROOM_TYPES].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: filterType === t ? PRIMARY : 'transparent',
                    color: filterType === t ? '#fff' : TEXT_MUTE,
                    borderColor: filterType === t ? PRIMARY : BORDER,
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Room number, department…" className="pl-8 text-xs h-8"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0"
              onClick={() => { setSelectedRoom(null); setSheetMode('add'); }}>
              <Plus size={13} /> Add Room
            </Button>
          </div>
        </div>
        {/* Mobile */}
        <div className="lg:hidden space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Room number…" className="pl-8 text-xs h-8"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-shrink-0"
              onClick={() => { setSelectedRoom(null); setSheetMode('add'); }}>
              <Plus size={13} /> Add
            </Button>
          </div>
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div className="flex gap-1.5 w-max">
              {['All', ...ROOM_TYPES].map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap"
                  style={{
                    background: filterType === t ? PRIMARY : 'transparent',
                    color: filterType === t ? '#fff' : TEXT_MUTE,
                    borderColor: filterType === t ? PRIMARY : BORDER,
                  }}>
                  {t}
                </button>
              ))}
            </div>
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
              <Card key={room.id}
                className={`border shadow-sm hover:shadow-md transition-all bg-card overflow-hidden cursor-pointer active:scale-[0.99] ${isMaintenance ? 'opacity-75' : ''}`}
                onClick={() => { setSelectedRoom(room); setSheetMode('view'); }}>
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
          onStatusChange={handleQuickStatus}
        />
      )}
    </div>
  );
};
