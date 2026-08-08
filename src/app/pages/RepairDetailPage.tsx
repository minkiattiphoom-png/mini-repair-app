import { ArrowLeft, Smartphone, Laptop, Monitor, Tablet, Tv, Wrench, QrCode, Printer, Edit2, CheckCircle, Search, ClipboardList, AlertCircle, Settings, Award, Package, ShieldCheck } from 'lucide-react';
import type { RepairJob, RepairStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import QRCode from 'react-qr-code';
import { useState } from 'react';

interface Props { job: RepairJob; onBack: () => void; onUpdateStatus: (id: string, status: RepairStatus) => void }

const deviceIcons: Record<string, React.ElementType> = {
  'โทรศัพท์มือถือ': Smartphone, 'โน้ตบุ๊ก': Laptop, 'คอมพิวเตอร์': Monitor, 'แท็บเล็ต': Tablet, 'โทรทัศน์': Tv,
};

const allSteps: RepairStatus[] = ['รับเครื่อง', 'ตรวจสอบ', 'เสนอราคา', 'รออนุมัติ', 'กำลังซ่อม', 'ทดสอบ', 'ซ่อมเสร็จ', 'รับเครื่องแล้ว'];
const stepIcons: Record<RepairStatus, React.ElementType> = {
  'รับเครื่อง': CheckCircle, 'ตรวจสอบ': Search, 'เสนอราคา': ClipboardList,
  'รออนุมัติ': AlertCircle, 'กำลังซ่อม': Wrench, 'ทดสอบ': Settings,
  'ซ่อมเสร็จ': Award, 'รับเครื่องแล้ว': Package,
};

const allStatuses: RepairStatus[] = allSteps;

export default function RepairDetailPage({ job, onBack, onUpdateStatus }: Props) {
  const [showQR, setShowQR] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const DeviceIcon = deviceIcons[job.device] ?? Wrench;
  const currentStepIdx = allSteps.indexOf(job.status);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">{job.jobNumber}</h2>
          <p className="text-xs text-muted-foreground">รับเมื่อ {job.createdAt}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowQR(s => !s)} className="flex items-center gap-1.5 px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium hover:bg-muted/70 transition-colors">
            <QrCode className="w-3.5 h-3.5" />QR
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-muted border border-border rounded-xl text-xs font-medium hover:bg-muted/70 transition-colors">
            <Printer className="w-3.5 h-3.5" />พิมพ์
          </button>
        </div>
      </div>

      {/* QR panel */}
      {showQR && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm">
          <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
            <QRCode value={`MINIREPAIR:${job.jobNumber}:${job.qrToken}`} size={160} fgColor="#0F172A" />
          </div>
          <p className="text-xs text-muted-foreground">ให้ลูกค้าสแกนเพื่อดูสถานะงานซ่อม</p>
        </div>
      )}

      {/* Device info */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <DeviceIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="font-bold text-foreground">{job.brand} {job.model}</div>
              <div className="text-xs text-muted-foreground">{job.device}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <button onClick={() => setEditStatus(s => !s)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {editStatus && (
          <div className="mb-4 p-3 bg-muted rounded-xl">
            <div className="text-xs font-medium text-muted-foreground mb-2">เปลี่ยนสถานะ</div>
            <div className="flex flex-wrap gap-1.5">
              {allStatuses.map(s => (
                <button key={s} onClick={() => { onUpdateStatus(job.id, s); setEditStatus(false); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${job.status === s ? 'bg-primary text-white' : 'bg-card border border-border hover:bg-muted'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            ['ชื่อลูกค้า', job.customerName],
            ['เบอร์โทร', job.phone],
            ['อาการเสีย', job.problem],
            ['ซีเรียลนัมเบอร์', job.serialNumber || '—'],
            ['ราคาประเมิน', job.estimatedCost > 0 ? `฿${job.estimatedCost.toLocaleString()}` : 'ยังไม่แจ้งราคา'],
            ['ราคาจริง', job.actualCost > 0 ? `฿${job.actualCost.toLocaleString()}` : '—'],
            ['ช่าง', job.technician || 'ยังไม่มอบหมาย'],
            ['วันที่รับ', job.createdAt],
          ].map(([lbl, val]) => (
            <div key={lbl as string} className="flex gap-2">
              <span className="text-muted-foreground text-xs w-28 flex-shrink-0">{lbl}</span>
              <span className="font-medium text-foreground text-xs">{val}</span>
            </div>
          ))}
        </div>

        {job.diagnosis && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <div className="text-xs font-semibold text-amber-700 mb-0.5">ผลการตรวจสอบ</div>
            <p className="text-sm text-foreground">{job.diagnosis}</p>
          </div>
        )}

        {job.repairDetail && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="text-xs font-semibold text-primary mb-0.5">รายละเอียดการซ่อม</div>
            <p className="text-sm text-foreground">{job.repairDetail}</p>
          </div>
        )}

        {job.hasWarranty && (
          <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-green-700">รับประกัน {job.warrantyDays} วัน</div>
              <div className="text-xs text-green-600">หมดอายุ {job.warrantyExpiry} {job.warrantyExpiry >= today ? '✓ ยังอยู่ในประกัน' : '⚠️ หมดแล้ว'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Status history */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4 text-sm">ประวัติสถานะ</h3>
        <div className="space-y-0">
          {allSteps.map((step, i) => {
            const done = i <= currentStepIdx;
            const current = i === currentStepIdx;
            const Icon = stepIcons[step];
            const h = job.statusHistory.find(x => x.status === step);
            return (
              <div key={step} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${current ? 'border-primary bg-primary text-white' : done ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {i < allSteps.length - 1 && <div className={`w-0.5 h-5 mt-0.5 ${done && i < currentStepIdx ? 'bg-primary' : 'bg-border'}`} />}
                </div>
                <div className="pb-3 flex-1">
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-sm font-medium ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                    {current && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-medium">ปัจจุบัน</span>}
                  </div>
                  {h && <div className="text-xs text-muted-foreground mt-0.5">{h.at} — {h.by}</div>}
                  {h?.note && <div className="text-xs text-muted-foreground italic">"{h.note}"</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
