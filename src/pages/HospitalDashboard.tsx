import React, { useEffect, useState } from 'react';
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
import { fetchPatients } from '@/services/patientService';
import { fetchRooms } from '@/services/roomService';
import { fetchDoctors } from '@/services/doctorService';
import { fetchActiveAdmissions } from '@/services/admissionService';

// ── Colours ──────────────────────────────────────────────────────
const PRIMARY       = 'hsl(220, 48%, 42%)';
const PRIMARY_LIGHT = 'hsl(220, 55%, 60%)';
const SUCCESS       = 'hsl(158, 70%, 36%)';
const WARNING       = 'hsl(33, 92%, 48%)';
const DANGER        = 'hsl(354, 70%, 50%)';

// ── Room type colours ─────────────────────────────────────────────
const ROOM_TYPE_COLORS: Record<string, string> = {
  ICU:           DANGER,
  Private:       PRIMARY,
  'Semi-Private': PRIMARY_LIGHT,
  General:       SUCCESS,
  Deluxe:        WARNING,
  Suite:         'hsl(270, 55%, 55%)',
};

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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Main component ────────────────────────────────────────────────
export const HospitalDashboard = () => {
  const navigate = useNavigate();

  // ── State ────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);

  // Stat card counts
  const [totalPatients, setTotalPatients]     = useState(0);
  const [admittedCount, setAdmittedCount]     = useState(0);
  const [criticalCount, setCriticalCount]     = useState(0);
  const [dischargedToday, setDischargedToday] = useState(0);
  const [activeDoctors, setActiveDoctors]     = useState(0);

  // Chart data
  const [roomOccupancy, setRoomOccupancy]       = useState<{ type: string; total: number; occupied: number; color: string }[]>([]);
  const [deptLoad, setDeptLoad]                 = useState<{ dept: string; patients: number }[]>([]);
  const [admissionsTrend, setAdmissionsTrend]   = useState<{ day: string; admissions: number; discharges: number }[]>([]);
  const [recentPatients, setRecentPatients]      = useState<{ id: string; name: string; dept: string; status: string; time: string }[]>([]);

  // ── Fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [patients, rooms, doctors, admissions] = await Promise.all([
          fetchPatients(),
          fetchRooms(),
          fetchDoctors(),
          fetchActiveAdmissions(),
        ]);

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);

        // ── Stat cards ──────────────────────────────────────────────
        setTotalPatients(patients.length);
        setAdmittedCount(patients.filter(p => p.status === 'Admitted').length);
        setCriticalCount(patients.filter(p => p.status === 'Critical').length);
        setDischargedToday(patients.filter(p => p.status === 'Discharged' && p.lastVisit?.startsWith(todayStr)).length);
        setActiveDoctors(doctors.filter(d => d.status === 'Active').length);

        // ── Room occupancy by type ──────────────────────────────────
        const roomMap: Record<string, { total: number; occupied: number }> = {};
        for (const room of rooms) {
          if (!roomMap[room.type]) roomMap[room.type] = { total: 0, occupied: 0 };
          roomMap[room.type].total += 1;
          if (room.status === 'Occupied') roomMap[room.type].occupied += 1;
        }
        const occupancy = Object.entries(roomMap).map(([type, d]) => ({
          type,
          total: d.total,
          occupied: d.occupied,
          color: ROOM_TYPE_COLORS[type] ?? PRIMARY,
        }));
        setRoomOccupancy(occupancy);

        // ── Department load (top 7) ─────────────────────────────────
        const deptMap: Record<string, number> = {};
        for (const p of patients) {
          if (p.department) deptMap[p.department] = (deptMap[p.department] || 0) + 1;
        }
        const deptArr = Object.entries(deptMap)
          .map(([dept, patients]) => ({ dept, patients }))
          .sort((a, b) => b.patients - a.patients)
          .slice(0, 7);
        setDeptLoad(deptArr);

        // ── Admissions trend by day-of-week ─────────────────────────
        const admByDay: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun=0 … Sat=6
        for (const adm of admissions) {
          if (adm.admissionDate) {
            const dow = new Date(adm.admissionDate).getDay();
            admByDay[dow] += 1;
          }
        }
        // Discharged patients bucketed by lastVisit day-of-week
        const disByDay: number[] = [0, 0, 0, 0, 0, 0, 0];
        for (const p of patients) {
          if (p.status === 'Discharged' && p.lastVisit) {
            const dow = new Date(p.lastVisit).getDay();
            disByDay[dow] += 1;
          }
        }
        // Reorder Mon–Sun
        const trendData = [1, 2, 3, 4, 5, 6, 0].map(dow => ({
          day: DAY_LABELS[dow],
          admissions: admByDay[dow],
          discharges: disByDay[dow],
        }));
        setAdmissionsTrend(trendData);

        // ── Recent patients (last 5 by lastVisit) ───────────────────
        const sorted = [...patients]
          .filter(p => p.lastVisit)
          .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
          .slice(0, 5);

        const recent = sorted.map(p => {
          const diffMs = today.getTime() - new Date(p.lastVisit).getTime();
          const diffH  = Math.round(diffMs / 36e5);
          const time   = diffH < 1 ? 'just now' : diffH < 24 ? `${diffH}h ago` : `${Math.floor(diffH / 24)}d ago`;
          return { id: p.patientId || p.id, name: p.name, dept: p.department, status: p.status, time };
        });
        setRecentPatients(recent);
      } catch (err) {
        console.error('HospitalDashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived from room state ──────────────────────────────────────
  const totalRooms    = roomOccupancy.reduce((s, r) => s + r.total, 0);
  const occupiedRooms = roomOccupancy.reduce((s, r) => s + r.occupied, 0);
  const availableRooms = totalRooms - occupiedRooms;
  const occupancyPct   = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const pieData = roomOccupancy.map(r => ({ name: r.type, value: r.occupied, color: r.color }));

  return (
    <div className="space-y-5">
      {/* ── KPI row ── */}
      <div className="stat-cards-scroll grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Patients" value={loading ? '—' : totalPatients}
          sub={loading ? '' : `${admittedCount} admitted`}
          icon={Users} color={PRIMARY}
          trend={{ value: 12, positive: true }}
          onClick={() => navigate('/patients')}
        />
        <StatCard
          label="Available Rooms" value={loading ? '—' : availableRooms}
          sub={loading ? '' : `${occupancyPct}% occupancy`}
          icon={BedDouble} color={SUCCESS}
          trend={{ value: 5, positive: false }}
          onClick={() => navigate('/rooms')}
        />
        <StatCard
          label="Doctors On Duty" value={loading ? '—' : activeDoctors}
          sub="Active doctors"
          icon={Stethoscope} color={PRIMARY_LIGHT}
          onClick={() => navigate('/doctors')}
        />
        <StatCard
          label="Critical Patients" value={loading ? '—' : criticalCount}
          sub="ICU monitoring"
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
              <p className="text-xs text-muted-foreground">By day of week</p>
            </div>
          </div>
          {loading ? (
            <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={admissionsTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
          )}
        </div>

        {/* Room occupancy pie */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Room Occupancy</h3>
            <p className="text-xs text-muted-foreground">{occupiedRooms} of {totalRooms} rooms occupied</p>
          </div>
          {loading ? (
            <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {roomOccupancy.map(r => (
                  <div key={r.type} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                      <span className="text-muted-foreground">{r.type}</span>
                    </div>
                    <span className="font-medium text-foreground">{r.occupied}/{r.total}</span>
                  </div>
                ))}
              </div>
            </>
          )}
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
            {loading ? (
              <div className="px-4 py-6 text-sm text-muted-foreground text-center">Loading…</div>
            ) : recentPatients.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.dept}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'} border-0 text-[10px] pointer-events-none`}>{p.status}</Badge>
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
          {/* Appointments — no appointments module yet */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Today's Appointments</h3>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {([] as { time: string; patient: string; doctor: string; dept: string }[]).map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="text-xs font-semibold text-primary w-10 flex-shrink-0 mt-0.5">{a.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{a.patient}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{a.doctor}</p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 text-xs text-muted-foreground text-center">No appointments scheduled</div>
            </div>
          </div>

          {/* Dept load bar */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Department Load</h3>
            {loading ? (
              <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={deptLoad} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="dept" tick={{ fontSize: 10, fill: 'hsl(220 12% 52%)' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="patients" name="Patients" fill={PRIMARY} radius={[0, 3, 3, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
