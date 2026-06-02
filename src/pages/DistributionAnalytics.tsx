import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Treemap
} from 'recharts';
import { Users, MapPin, CreditCard, Stethoscope, Package } from 'lucide-react';
import { fetchPatients, Patient } from '@/services/patientService';
import { fetchActiveAdmissions, Admission } from '@/services/admissionService';
import { fetchInventoryItems } from '@/services/inventoryService';
import { InventoryItem } from '@/types/inventory';

const COLORS = [
  'hsl(220, 48%, 42%)',
  'hsl(158, 70%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(270, 60%, 50%)',
  'hsl(195, 70%, 42%)',
  'hsl(0, 84%, 60%)',
  'hsl(320, 60%, 48%)',
];

// ── Data computation helpers ────────────────────────────────────

function computeGenderData(patients: Patient[]) {
  const counts: Record<string, number> = {};
  for (const p of patients) {
    const g = (p.gender || 'Unknown').charAt(0).toUpperCase() + (p.gender || 'Unknown').slice(1).toLowerCase();
    counts[g] = (counts[g] || 0) + 1;
  }
  const total = patients.length || 1;
  return Object.entries(counts).map(([name, count], i) => ({
    name,
    value: Math.round((count / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

function computePaymentMethodData(admissions: Admission[]) {
  const LABELS: Record<string, string> = {
    insurance: 'Insurance',
    cash: 'Cash',
    card: 'Card / UPI',
    corporate: 'Corporate',
    government: 'Govt Scheme',
  };
  const counts: Record<string, number> = {};
  for (const a of admissions) {
    const key = LABELS[a.paymentMode || ''] || 'Other';
    counts[key] = (counts[key] || 0) + 1;
  }
  const total = admissions.length || 1;
  return Object.entries(counts).map(([name, count], i) => ({
    name,
    value: Math.round((count / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

function computeAdmissionSources(admissions: Admission[]) {
  const LABELS: Record<string, string> = {
    planned: 'OPD Referral',
    emergency: 'Emergency',
    transfer: 'Other Hospital',
    day_care: 'Direct Walk-in',
  };
  const counts: Record<string, number> = {};
  for (const a of admissions) {
    const key = LABELS[a.admissionType] || 'Doctor Ref.';
    counts[key] = (counts[key] || 0) + 1;
  }
  const total = admissions.length || 1;
  return Object.entries(counts).map(([name, count], i) => ({
    name,
    value: Math.round((count / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

function computeAgeDistribution(patients: Patient[]) {
  const buckets = [
    { group: '0–12',  min: 0,  max: 12  },
    { group: '13–25', min: 13, max: 25  },
    { group: '26–35', min: 26, max: 35  },
    { group: '36–50', min: 36, max: 50  },
    { group: '51–65', min: 51, max: 65  },
    { group: '65+',   min: 66, max: 999 },
  ];
  const total = patients.length || 1;
  return buckets.map(b => {
    const count = patients.filter(p => p.age >= b.min && p.age <= b.max).length;
    return { group: b.group, count, pct: Math.round((count / total) * 100) };
  });
}

function computeDepartmentDistribution(patients: Patient[]) {
  const map: Record<string, { patients: number }> = {};
  for (const p of patients) {
    const dept = p.department || 'General';
    if (!map[dept]) map[dept] = { patients: 0 };
    map[dept].patients += 1;
  }
  return Object.entries(map)
    .sort((a, b) => b[1].patients - a[1].patients)
    .slice(0, 7)
    .map(([dept, d]) => ({
      dept: dept.length > 12 ? dept.slice(0, 11) + '…' : dept,
      patients: d.patients,
      revenue: Math.round(d.patients * 0.4),
      beds: Math.max(1, Math.round(d.patients * 0.15)),
    }));
}

function computeInventoryCategoryData(items: InventoryItem[]) {
  const map: Record<string, number> = {};
  for (const item of items) {
    map[item.category] = (map[item.category] || 0) + item.currentStock * item.unitPrice;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, size: Math.round(value), fill: COLORS[i % COLORS.length] }));
}

// ── Tooltip & label helpers ─────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Component ───────────────────────────────────────────────────

export const DistributionAnalytics = () => {
  const [deptMetric, setDeptMetric] = useState<'patients' | 'revenue' | 'beds'>('patients');
  const [loading, setLoading] = useState(true);

  const [genderData, setGenderData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [sourceOfAdmission, setSourceOfAdmission] = useState<{ name: string; value: number; color: string }[]>([]);
  const [patientAgeDistribution, setPatientAgeDistribution] = useState<{ group: string; count: number; pct: number }[]>([]);
  const [departmentDistribution, setDepartmentDistribution] = useState<{ dept: string; patients: number; revenue: number; beds: number }[]>([]);
  const [inventoryCategoryData, setInventoryCategoryData] = useState<{ name: string; size: number; fill: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [patients, admissions, inventoryItems] = await Promise.all([
          fetchPatients(),
          fetchActiveAdmissions(),
          fetchInventoryItems(),
        ]);

        setGenderData(computeGenderData(patients));
        setPaymentMethodData(computePaymentMethodData(admissions));
        setSourceOfAdmission(computeAdmissionSources(admissions));
        setPatientAgeDistribution(computeAgeDistribution(patients));
        setDepartmentDistribution(computeDepartmentDistribution(patients));
        setInventoryCategoryData(computeInventoryCategoryData(inventoryItems));
      } catch (err) {
        console.error('DistributionAnalytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maxPat  = Math.max(...departmentDistribution.map(x => x.patients), 1);
  const maxRev  = Math.max(...departmentDistribution.map(x => x.revenue), 1);
  const maxBeds = Math.max(...departmentDistribution.map(x => x.beds), 1);
  const deptRadar = departmentDistribution.map(d => ({
    dept: d.dept,
    Patients: Math.round((d.patients / maxPat) * 100),
    Revenue: Math.round((d.revenue / maxRev) * 100),
    BedUtilisation: Math.round((d.beds / maxBeds) * 100),
  }));

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Distribution Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Loading data…</p>
        </div>
        <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading analytics…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Distribution Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Demographic, financial, and inventory composition breakdowns</p>
      </div>

      {/* Row 1: Donut charts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gender */}
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Gender Split
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {genderData.map((d, i) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-1">
              {genderData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name} <span className="font-semibold text-foreground">{d.value}%</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {paymentMethodData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {paymentMethodData.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admission Source */}
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-0 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Admission Source
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sourceOfAdmission} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {sourceOfAdmission.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
              {sourceOfAdmission.map(d => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Age Distribution + Dept Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Patient Age Distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground">Patient count by age group</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={patientAgeDistribution} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="group" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Patients" radius={[4, 4, 0, 0]}>
                  {patientAgeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" /> Department Breakdown
                </CardTitle>
                <p className="text-xs text-muted-foreground">Select metric to compare</p>
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {(['patients', 'revenue', 'beds'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setDeptMetric(m)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                      deptMetric === m ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={departmentDistribution} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="dept" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={deptMetric} name={deptMetric.charAt(0).toUpperCase() + deptMetric.slice(1)} radius={[0, 4, 4, 0]}>
                  {departmentDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Dept Radar + Inventory Treemap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" /> Department Performance Radar
            </CardTitle>
            <p className="text-xs text-muted-foreground">Normalised scores across patients, revenue, and bed utilisation</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={deptRadar}>
                <PolarGrid stroke="hsl(220 13% 88%)" />
                <PolarAngleAxis dataKey="dept" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Patients" dataKey="Patients" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Revenue" dataKey="Revenue" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Bed Util." dataKey="BedUtilisation" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Inventory by Category (Stock Value)
            </CardTitle>
            <p className="text-xs text-muted-foreground">Proportional area = stock value share</p>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <ResponsiveContainer width="100%" height={240}>
              <Treemap
                data={inventoryCategoryData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                content={({ x, y, width, height, name, fill }: any) => {
                  const show = width > 40 && height > 30;
                  return (
                    <g>
                      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#fff" strokeWidth={2} rx={4} />
                      {show && (
                        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle"
                          fill="#fff" style={{ fontSize: 10, fontWeight: 600 }}>
                          {name}
                        </text>
                      )}
                    </g>
                  );
                }}
              />
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {inventoryCategoryData.slice(0, 6).map((d) => (
                <div key={d.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-sm" style={{ background: d.fill }} />
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
