import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, BedDouble, Stethoscope, Activity, UserPlus, ArrowRight,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Heart, Thermometer,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Colours ──────────────────────────────────────────────────────
const PRIMARY       = 'hsl(220, 48%, 42%)';
const PRIMARY_LIGHT = 'hsl(220, 55%, 60%)';
const SUCCESS       = 'hsl(158, 70%, 36%)';
const WARNING       = 'hsl(33, 92%, 48%)';
const DANGER        = 'hsl(354, 70%, 50%)';

// ── Mock data ─────────────────────────────────────────────────────
const ADMISSIONS_TREND = [
  { day: 'Mon', admissions: 8, discharges: 5 },
  { day: 'Tue', admissions: 12, discharges: 9 },
  { day: 'Wed', admissions: 7, discharges: 11 },
  { day: 'Thu', admissions: 15, discharges: 8 },
  { day: 'Fri', admissions: 11, discharges: 13 },
  { day: 'Sat', admissions: 6, discharges: 7 },
  { day: 'Sun', admissions: 4, discharges: 5 },
];

const ROOM_OCCUPANCY = [
  { type: 'ICU', total: 10, occupied: 8, color: DANGER },
  { type: 'Private', total: 20, occupied: 14, color: PRIMARY },
  { type: 'Semi-Private', total: 30, occupied: 18, color: PRIMARY_LIGHT },
  { type: 'General', total: 50, occupied: 32, color: SUCCESS },
  { type: 'Deluxe', total: 8, occupied: 5, color: WARNING },
];

const DEPT_LOAD = [
  { dept: 'Cardiology', patients: 18 },
  { dept: 'Orthopaedics', patients: 14 },
  { dept: 'Neurology', patients: 11 },
  { dept: 'Gen. Medicine', patients: 22 },
  { dept: 'Paediatrics', patients: 9 },
  { dept: 'Oncology', patients: 7 },
  { dept: 'Emergency', patients: 16 },
];

const RECENT_PATIENTS = [
  { id: 'P-2401', name: 'Ananya Sharma', dept: 'Cardiology', room: '204', status: 'Admitted', time: '2h ago' },
  { id: 'P-2400', name: 'Rohan Mehta', dept: 'Orthopaedics', room: '112', status: 'Admitted', time: '4h ago' },
  { id: 'P-2399', name: 'Priya Nair', dept: 'Emergency', room: 'ICU-3', status: 'Critical', time: '5h ago' },
  { id: 'P-2398', name: 'Suresh Patel', dept: 'Gen. Medicine', room: '308', status: 'Stable', time: '6h ago' },
  { id: 'P-2397', name: 'Kavya Iyer', dept: 'Paediatrics', room: '115', status: 'Discharged', time: '7h ago' },
];

const UPCOMING_APPOINTMENTS = [
  { time: '09:30', patient: 'Amit Joshi', doctor: 'Dr. Sarah Johnson', dept: 'Cardiology' },
  { time: '10:00', patient: 'Deepa Rao', doctor: 'Dr. Emma Thompson', dept: 'Paediatrics' },
  { time: '10:45', patient: 'Vikram Singh', doctor: 'Dr. Michael Brown', dept: 'Orthopaedics' },
  { time: '11:15', patient: 'Meera Krishnan', doctor: 'Dr. Raj Patel', dept: 'Oncology' },
];

// ── Stat card ─────────────────────────────────────────────────────
const StatCard = ({
  label, value, sub, icon: Icon, color, onClick, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; onClick?: () => void;
  trend?: { value: number; positive: boolean };
}) => (
  <div
    onClick={onClick}
    className={`stat-card-clickable rounded-xl border border-border bg-card p-4 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center`} style={{ background: color + '20' }}>
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      {trend && (
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
          <TrendingUp className={`h-3 w-3 ${!trend.positive ? 'rotate-180' : ''}`} />
          {trend.value}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
    <p className="text-xs font-semibold text-foreground/80">{label}</p>
    {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const statusColor: Record<string, string> = {
  Admitted: 'bg-blue-100 text-blue-700',
  Critical: 'bg-red-100 text-red-700',
  Stable: 'bg-green-100 text-green-700',
  Discharged: 'bg-gray-100 text-gray-600',
};

// ── Main component ────────────────────────────────────────────────
export const HospitalDashboard = () => {
  const navigate = useNavigate();

  const totalRooms = ROOM_OCCUPANCY.reduce((s, r) => s + r.total, 0);
  const occupiedRooms = ROOM_OCCUPANCY.reduce((s, r) => s + r.occupied, 0);
  const availableRooms = totalRooms - occupiedRooms;
  const occupancyPct = Math.round((occupiedRooms / totalRooms) * 100);

  const pieData = ROOM_OCCUPANCY.map(r => ({ name: r.type, value: r.occupied, color: r.color }));

  return (
    <div className="space-y-5">
      {/* ── KPI row ── */}
      <div className="stat-cards-scroll grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Patients" value={97} sub="8 admitted today"
          icon={Users} color={PRIMARY}
          trend={{ value: 12, positive: true }}
          onClick={() => navigate('/patients')}
        />
        <StatCard
          label="Available Rooms" value={availableRooms} sub={`${occupancyPct}% occupancy`}
          icon={BedDouble} color={SUCCESS}
          trend={{ value: 5, positive: false }}
          onClick={() => navigate('/rooms')}
        />
        <StatCard
          label="Doctors On Duty" value={14} sub="7 departments covered"
          icon={Stethoscope} color={PRIMARY_LIGHT}
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          label="Critical Patients" value={3} sub="ICU monitoring"
          icon={Activity} color={DANGER}
          trend={{ value: 1, positive: false }}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Admissions trend */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Admissions vs Discharges</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={ADMISSIONS_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="disGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SUCCESS} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={SUCCESS} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 18% 90%)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(220 18% 88%)' }} />
              <Area type="monotone" dataKey="admissions" name="Admissions" stroke={PRIMARY} strokeWidth={2} fill="url(#admGrad)" dot={false} />
              <Area type="monotone" dataKey="discharges" name="Discharges" stroke={SUCCESS} strokeWidth={2} fill="url(#disGrad)" dot={false} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Room occupancy pie */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Room Occupancy</h3>
            <p className="text-xs text-muted-foreground">{occupiedRooms} of {totalRooms} rooms occupied</p>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {ROOM_OCCUPANCY.map(r => (
              <div key={r.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-muted-foreground">{r.type}</span>
                </div>
                <span className="font-medium text-foreground">{r.occupied}/{r.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent patients */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Admissions</h3>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary" onClick={() => navigate('/patients')}>
              View all <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {RECENT_PATIENTS.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.dept} · Room {p.room}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${statusColor[p.status]} border-0 text-[10px] pointer-events-none`}>{p.status}</Badge>
                  <span className="text-[11px] text-muted-foreground">{p.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-border">
            <Button size="sm" className="w-full gap-2" onClick={() => navigate('/patients/admit')}>
              <UserPlus className="h-4 w-4" /> Admit New Patient
            </Button>
          </div>
        </div>

        {/* Today's appointments + dept load */}
        <div className="space-y-4">
          {/* Appointments */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Today's Appointments</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {UPCOMING_APPOINTMENTS.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-xs font-semibold text-primary w-10 flex-shrink-0 mt-0.5">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.doctor}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dept load bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Department Load</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={DEPT_LOAD} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="patients" name="Patients" fill={PRIMARY} radius={[0, 3, 3, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
