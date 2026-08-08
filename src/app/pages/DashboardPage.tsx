import {
  ClipboardList,CheckCircle,Clock,Banknote,TrendingUp,ArrowUpRight,Wrench,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import type { RepairJob, AdminPage } from '../types';
import { monthlyStats, deviceTypeStats } from '../data';
import StatusBadge from '../components/StatusBadge';

interface Props {
  jobs: RepairJob[];
  onNavigate: (p: AdminPage) => void;
}

export default function DashboardPage({ jobs, onNavigate }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.createdAt === today || j.updatedAt === today);
  const completed = jobs.filter(j => j.status === 'ซ่อมเสร็จ' || j.status === 'รับเครื่องแล้ว');
  const inProgress = jobs.filter(j => ['กำลังซ่อม', 'ตรวจสอบ', 'รออนุมัติ', 'เสนอราคา', 'ทดสอบ'].includes(j.status));
  const withWarranty = jobs.filter(j => j.hasWarranty && j.warrantyExpiry >= today);
  const monthRevenue = jobs.filter(j => j.actualCost > 0).reduce((s, j) => s + j.actualCost, 0);

  const recent = [...jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const stats = [
    { label: 'งานวันนี้', value: todayJobs.length, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50', trend: '' },
    { label: 'ซ่อมเสร็จ', value: completed.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', trend: '' },
    { label: 'กำลังดำเนินการ', value: inProgress.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '' },
    { label: 'รายได้ (มีข้อมูล)', value: `฿${monthRevenue.toLocaleString()}`, icon: Banknote, color: 'text-purple-600', bg: 'bg-purple-50', trend: '' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">สวัสดีตอนเช้า 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">ภาพรวมงานซ่อมของ มินิช่อม วันนี้</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4.5 h-4.5 ${color} w-4 h-4`} />
            </div>
            <div className="text-xl font-bold text-foreground leading-none mb-1">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'รับเครื่อง', count: jobs.filter(j => j.status === 'รับเครื่อง').length, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'รออนุมัติ', count: jobs.filter(j => j.status === 'รออนุมัติ').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'กำลังซ่อม', count: jobs.filter(j => j.status === 'กำลังซ่อม').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'อยู่ในประกัน', count: withWarranty.length, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 text-center border border-border`}>
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">งานซ่อมรายเดือน</h3>
              <p className="text-xs text-muted-foreground mt-0.5">จำนวนงานต่อเดือน</p>
            </div>
            <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />+29%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="jobs" name="งาน" stroke="#2563EB" strokeWidth={2.5} fill="url(#blueGrad)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground mb-1">ประเภทอุปกรณ์</h3>
          <p className="text-xs text-muted-foreground mb-3">สัดส่วนงานซ่อม</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={deviceTypeStats} cx="50%" cy="50%" innerRadius={35} outerRadius={58} dataKey="value" strokeWidth={0}>
                {deviceTypeStats.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {deviceTypeStats.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-muted-foreground">{name}</span>
                </div>
                <span className="font-semibold text-foreground">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-1">รายได้รายเดือน</h3>
        <p className="text-xs text-muted-foreground mb-4">รายได้ (บาท)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyStats} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={v => `฿${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`฿${v.toLocaleString()}`, 'รายได้']} contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} cursor={{ fill: '#F1F5F9', radius: 8 }} />
            <Bar dataKey="revenue" name="รายได้" fill="#2563EB" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent jobs */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="font-semibold text-foreground">งานล่าสุด</h3>
          <button onClick={() => onNavigate('repairs')} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            ดูทั้งหมด <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-border">
          {recent.map(job => (
            <div key={job.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{job.customerName}</div>
                <div className="text-xs text-muted-foreground truncate">{job.brand} {job.model} — {job.jobNumber}</div>
              </div>
              <div className="hidden sm:block text-xs text-muted-foreground w-20 text-right">{job.updatedAt}</div>
              <StatusBadge status={job.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
