import { useState } from 'react';
import {
  Search,Plus,Phone,Mail,ChevronRight,ArrowLeft,ClipboardList,MessageSquare,type LucideIcon,
} from 'lucide-react';
import type { Customer, RepairJob } from '../types';
import StatusBadge from '../components/StatusBadge';

interface Props { customers: Customer[]; jobs: RepairJob[] }

function CustomerProfile({ c, jobs, onBack }: { c: Customer; jobs: RepairJob[]; onBack: () => void }) {
  const cJobs = jobs.filter(j => j.customerId === c.id || j.customerName === c.name);
  const total = cJobs.reduce((s, j) => s + j.actualCost, 0);

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
        <div><h2 className="text-lg font-bold text-foreground">โปรไฟล์ลูกค้า</h2><p className="text-xs text-muted-foreground">{c.id}</p></div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
            {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-base">{c.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">ลูกค้าตั้งแต่ {c.createdAt}</p>
            {c.notes && <p className="text-xs text-primary font-medium mt-1">{c.notes}</p>}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          {[
  [Phone, c.phone],
  [Mail, c.email],
  [MessageSquare, c.lineId ? `LINE: ${c.lineId}` : null],
]
  .filter(([, v]) => v)
  .map(([Icon, val], i) => {
    const IconComponent = Icon as LucideIcon;

    return (
      <div key={i} className="flex items-center gap-2.5 text-muted-foreground">
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">{val as string}</span>
      </div>
    );
  })}
          {c.address && <p className="text-xs text-muted-foreground pl-6">{c.address}</p>}
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border text-center">
          {[['งานทั้งหมด', cJobs.length], ['เสร็จสมบูรณ์', cJobs.filter(j => j.status === 'ซ่อมเสร็จ' || j.status === 'รับเครื่องแล้ว').length], ['ยอดรวม', `฿${total.toLocaleString()}`]].map(([l, v]) => (
            <div key={l as string}><div className="font-bold text-lg text-foreground">{v}</div><div className="text-xs text-muted-foreground">{l}</div></div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">ประวัติงานซ่อม</h3>
        </div>
        {cJobs.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">ยังไม่มีงานซ่อม</div>
        ) : (
          <div className="divide-y divide-border">
            {cJobs.map((job, i) => (
              <div key={job.id} className="flex gap-3 px-5 py-4">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${job.status === 'ซ่อมเสร็จ' || job.status === 'รับเครื่องแล้ว' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{i + 1}</div>
                  {i < cJobs.length - 1 && <div className="flex-1 w-px bg-border min-h-4" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-primary">{job.jobNumber}</span>
                      <div className="text-sm font-medium text-foreground mt-0.5">{job.brand} {job.model}</div>
                      <div className="text-xs text-muted-foreground">{job.problem}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={job.status} />
                      {job.actualCost > 0 && <span className="text-xs font-bold text-foreground">฿{job.actualCost.toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{job.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage({ customers, jobs }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  if (selected) return <CustomerProfile c={selected} jobs={jobs} onBack={() => setSelected(null)} />;

  const filtered = customers.filter(c =>
    c.name.includes(search) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-foreground">ลูกค้า</h2><p className="text-sm text-muted-foreground">{customers.length} คน</p></div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 shadow-sm transition-colors">
          <Plus className="w-4 h-4" /><span className="hidden sm:inline">เพิ่มลูกค้า</span>
        </button>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ เบอร์ หรืออีเมล..."
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const cJobs = jobs.filter(j => j.customerId === c.id || j.customerName === c.name);
          const total = cJobs.reduce((s, j) => s + j.actualCost, 0);
          return (
            <button key={c.id} onClick={() => setSelected(c)}
              className="bg-card border border-border rounded-2xl p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div><div className="font-semibold text-foreground text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.id}</div></div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 flex-shrink-0" /><span>{c.phone}</span></div>
                {c.lineId && <div className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 flex-shrink-0" /><span>LINE: {c.lineId}</span></div>}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground"><ClipboardList className="w-3.5 h-3.5" />{cJobs.length} งาน</div>
                <span className="font-semibold text-foreground">฿{total.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
