import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Treemap
} from 'recharts';
import { Users, MapPin, CreditCard, Stethoscope, Package } from 'lucide-react';

const COLORS = [
  'hsl(220, 48%, 42%)',
  'hsl(158, 70%, 36%)',
  'hsl(38, 92%, 50%)',
  'hsl(270, 60%, 50%)',
  'hsl(195, 70%, 42%)',
  'hsl(0, 84%, 60%)',
  'hsl(320, 60%, 48%)',
];

const patientAgeDistribution = [
  { group: '0–12',  count: 48,  pct: 8 },
  { group: '13–25', count: 72,  pct: 12 },
  { group: '26–35', count: 108, pct: 18 },
  { group: '36–50', count: 156, pct: 26 },
  { group: '51–65', count: 132, pct: 22 },
  { group: '65+',   count: 84,  pct: 14 },
];

const paymentMethodData = [
  { name: 'Insurance',    value: 42, color: COLORS[0] },
  { name: 'Cash',         value: 24, color: COLORS[1] },
  { name: 'Card / UPI',   value: 18, color: COLORS[2] },
  { name: 'Govt Scheme',  value: 12, color: COLORS[3] },
  { name: 'Corporate',    value: 4,  color: COLORS[4] },
];

const departmentDistribution = [
  { dept: 'General',     patients: 220, revenue: 48, beds: 40 },
  { dept: 'Cardiology',  patients: 140, revenue: 92, beds: 20 },
  { dept: 'Ortho',       patients: 110, revenue: 64, beds: 18 },
  { dept: 'Neurology',   patients: 80,  revenue: 78, beds: 14 },
  { dept: 'Paediatrics', patients: 95,  revenue: 38, beds: 16 },
  { dept: 'Oncology',    patients: 60,  revenue: 110, beds: 12 },
  { dept: 'Emergency',   patients: 180, revenue: 55, beds: 30 },
];

const genderData = [
  { name: 'Male',   value: 54, color: COLORS[0] },
  { name: 'Female', value: 44, color: COLORS[4] },
  { name: 'Other',  value: 2,  color: COLORS[2] },
];

const inventoryCategoryData = [
  { name: 'Antibiotics',       size: 320, fill: COLORS[0] },
  { name: 'Analgesics',        size: 240, fill: COLORS[1] },
  { name: 'Surgical Supplies', size: 180, fill: COLORS[2] },
  { name: 'Cardiovascular',    size: 150, fill: COLORS[3] },
  { name: 'Diagnostics Kits',  size: 120, fill: COLORS[4] },
  { name: 'IV Fluids',         size: 110, fill: COLORS[5] },
  { name: 'Orthopaedic',       size: 90,  fill: COLORS[6] },
  { name: 'Vitamins',          size: 80,  fill: COLORS[0] },
  { name: 'Dermatology',       size: 70,  fill: COLORS[1] },
  { name: 'Ophthalmology',     size: 55,  fill: COLORS[2] },
];

const sourceOfAdmission = [
  { name: 'OPD Referral',  value: 38, color: COLORS[0] },
  { name: 'Emergency',     value: 28, color: COLORS[5] },
  { name: 'Direct Walk-in',value: 18, color: COLORS[1] },
  { name: 'Doctor Ref.',   value: 10, color: COLORS[2] },
  { name: 'Other Hospital',value: 6,  color: COLORS[3] },
];

const deptRadar = departmentDistribution.map(d => ({
  dept: d.dept,
  Patients: Math.round((d.patients / 220) * 100),
  Revenue: Math.round((d.revenue / 110) * 100),
  BedUtilisation: Math.round((d.beds / 40) * 100),
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label || payload[0]?.name}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey || p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}{typeof p.value === 'number' && p.value <= 100 ? (p.payload?.pct ? '' : '%') : ''}</span>
        </div>
      ))}
    </div>
  );
};

const DonutLabel = ({ cx, cy, label, value }: any) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground" style={{ fontSize: 22, fontWeight: 700 }}>{value}</text>
    <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 11 }}>{label}</text>
  </>
);

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const DistributionAnalytics = () => {
  const [deptMetric, setDeptMetric] = useState<'patients' | 'revenue' | 'beds'>('patients');

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
