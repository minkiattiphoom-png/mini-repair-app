import { useState } from 'react';
import { Plus, Filter, Eye, Edit2, QrCode, Trash2, ChevronDown,  } from 'lucide-react';
import type { RepairJob, RepairStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import QRCode from 'react-qr-code';

interface Props {
  jobs: RepairJob[];
  onAddNew: () => void;
  onUpdateStatus: (id: string, status: RepairStatus) => void;
  onDeleteJob: (id: string) => void;
  onViewDetail: (id: string) => void;
}

const allStatuses: RepairStatus[] = ['รับเครื่อง', 'ตรวจสอบ', 'เสนอราคา', 'รออนุมัติ', 'กำลังซ่อม', 'ทดสอบ', 'ซ่อมเสร็จ', 'รับเครื่องแล้ว'];

export default function RepairsPage({ jobs, onAddNew, onUpdateStatus, onDeleteJob, onViewDetail }: Props) {
  const [filterStatus, setFilterStatus] = useState<RepairStatus | 'ทั้งหมด'>('ทั้งหมด');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [qrJob, setQrJob] = useState<RepairJob | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = jobs.filter(j => {
  const matchStatus =
    filterStatus === 'ทั้งหมด' || j.status === filterStatus;

  return matchStatus;
});

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">งานซ่อม</h2>
          <p className="text-sm text-muted-foreground">{jobs.length} งานทั้งหมด</p>
        </div>
        <button onClick={onAddNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">เพิ่มงาน</span>
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
  <Filter className="w-4 h-4 text-muted-foreground" />

  <select
    value={filterStatus}
    onChange={e => {
      setFilterStatus(e.target.value as RepairStatus | 'ทั้งหมด');
      setPage(1);
    }}
    className="bg-transparent text-sm outline-none text-foreground"
  >
    <option value="ทั้งหมด">ทุกสถานะ</option>
    {allStatuses.map(s => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>

  <ChevronDown className="w-3 h-3 text-muted-foreground" />
</div>
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5 flex-wrap">
        {(['ทั้งหมด', ...allStatuses] as const).map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}>
            {s} ({s === 'ทั้งหมด' ? jobs.length : jobs.filter(j => j.status === s).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['เลขงาน', 'ลูกค้า', 'อุปกรณ์', 'วันที่รับ', 'ราคา', 'สถานะ', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paged.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">ไม่พบงานซ่อม</td></tr>
              ) : paged.map(job => (
                <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <button onClick={() => onViewDetail(job.id)} className="font-mono text-xs font-bold text-primary hover:underline">{job.jobNumber}</button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-foreground">{job.customerName}</div>
                    <div className="text-xs text-muted-foreground">{job.phone}</div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div className="text-foreground">{job.brand} {job.model}</div>
                    <div className="text-xs text-muted-foreground">{job.device}</div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs hidden md:table-cell">{job.createdAt}</td>
                  <td className="px-4 py-3.5 font-medium text-foreground text-xs hidden lg:table-cell">
                    {job.actualCost > 0 ? `฿${job.actualCost.toLocaleString()}` : job.estimatedCost > 0 ? `~฿${job.estimatedCost.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {editingId === job.id ? (
                      <select value={job.status} onChange={e => { onUpdateStatus(job.id, e.target.value as RepairStatus); setEditingId(null); }}
                        autoFocus onBlur={() => setEditingId(null)}
                        className="text-xs border border-primary rounded-lg px-2 py-1 bg-card outline-none">
                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : <StatusBadge status={job.status} />}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onViewDetail(job.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="ดูรายละเอียด"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingId(job.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="เปลี่ยนสถานะ"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setQrJob(job)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="QR Code"><QrCode className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDeleteJob(job.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive" title="ลบ"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">แสดง {(page-1)*perPage+1}–{Math.min(page*perPage, filtered.length)} จาก {filtered.length}</span>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)} className={`w-7 h-7 rounded-lg text-xs font-medium ${page===i+1?'bg-primary text-primary-foreground':'hover:bg-muted text-muted-foreground'}`}>{i+1}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQrJob(null)}>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-xs w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-foreground mb-0.5">{qrJob.jobNumber}</h3>
            <p className="text-sm text-muted-foreground mb-4">{qrJob.customerName} — {qrJob.brand} {qrJob.model}</p>
            <div className="flex justify-center p-3 bg-white border border-border rounded-xl mb-4">
              <QRCode value={`MINIREPAIR:${qrJob.jobNumber}:${qrJob.qrToken}`} size={180} fgColor="#0F172A" />
            </div>
            <p className="text-xs text-muted-foreground text-center mb-4">ให้ลูกค้าสแกนเพื่อดูสถานะงานซ่อม</p>
            <button onClick={() => setQrJob(null)} className="w-full bg-muted border border-border text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted/70">ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}
