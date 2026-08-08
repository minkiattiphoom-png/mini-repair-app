import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Banknote, CheckCircle, Clock } from 'lucide-react';
import type { RepairJob } from '../types';
import { monthlyStats, deviceTypeStats } from '../data';
import StatusBadge from '../components/StatusBadge';

interface Props { jobs: RepairJob[] }

const statusColors: Record<string, string> = {
  'รับเครื่อง': '#94A3B8', 'ตรวจสอบ': '#8B5CF6', 'เสนอราคา': '#38BDF8',
  'รออนุมัติ': '#F59E0B', 'กำลังซ่อม': '#2563EB', 'ทดสอบ': '#6366F1',
  'ซ่อมเสร็จ': '#22C55E', 'รับเครื่องแล้ว': '#10B981',
};

export default function ReportsPage({ jobs }: Props) {
  const totalRevenue = jobs.reduce((s, j) => s + j.actualCost, 0);
  const completed = jobs.filter(j => j.status === 'ซ่อมเสร็จ' || j.status === 'รับเครื่องแล้ว');
  const avg = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  const statusBreakdown = Object.entries(
    jobs.reduce<Record<string, number>>((acc, j) => { acc[j.status] = (acc[j.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value, color: statusColors[name] ?? '#94A3B8' }));

  const deviceRevenue = Object.entries(
    jobs.filter(j => j.actualCost > 0).reduce<Record<string, number>>((acc, j) => { acc[j.device] = (acc[j.device] || 0) + j.actualCost; return acc; }, {})
  ).map(([device, revenue]) => ({ device, revenue })).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div><h2 className="text-xl font-bold text-foreground">รายงาน</h2><p className="text-sm text-muted-foreground">ภาพรวมผลการดำเนินงาน</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'รายได้ทั้งหมด', value: `฿${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'รายได้เฉลี่ย/งาน', value: `฿${avg.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'งานทั้งหมด', value: jobs.length, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'อัตราสำเร็จ', value: `${jobs.length > 0 ? Math.round((completed.length / jobs.length) * 100) : 0}%`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div className="text-xl font-bold text-foreground leading-none mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">รายได้รายเดือน</h3>
          <p className="text-xs text-muted-foreground mb-4">แนวโน้มรายได้ (บาท)</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`฿${v.toLocaleString()}`, 'รายได้']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F1F5F9', radius: 8 }} />
              <Bar dataKey="revenue" name="รายได้" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">สถานะงานซ่อม</h3>
          <p className="text-xs text-muted-foreground mb-4">การกระจายงานปัจจุบัน</p>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={0}>
                {statusBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">งานซ่อมแยกตามประเภท</h3>
          <p className="text-xs text-muted-foreground mb-4">จำนวนงาน (%)</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={deviceTypeStats} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>{deviceTypeStats.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-4">รายได้แยกตามประเภท</h3>
          {deviceRevenue.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">ยังไม่มีข้อมูลรายได้</p> : (
            <div className="space-y-3">
              {deviceRevenue.map(({ device, revenue }) => {
                const max = deviceRevenue[0].revenue;
                return (
                  <div key={device}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{device}</span>
                      <span className="text-muted-foreground">฿{revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full"><div className="h-full bg-primary rounded-full" style={{ width: `${(revenue / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border"><h3 className="font-semibold text-foreground">งานที่มีรายได้</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">{['เลขงาน', 'ลูกค้า', 'อุปกรณ์', 'ราคา', 'ช่าง', 'สถานะ'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {jobs.filter(j => j.actualCost > 0).map(job => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{job.jobNumber}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{job.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{job.brand} {job.model}</td>
                  <td className="px-4 py-3 font-bold text-foreground">฿{job.actualCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{job.technician || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
