import { useState } from 'react';
import { ArrowLeft, Save, QrCode, Printer, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { RepairJob, DeviceType } from '../types';

interface Props { onSave: (job: RepairJob) => void; onBack: () => void; jobCount: number }

const deviceTypes: DeviceType[] = ['โทรศัพท์มือถือ', 'คอมพิวเตอร์', 'โน้ตบุ๊ก', 'แท็บเล็ต', 'โทรทัศน์', 'อื่นๆ'];
const technicians = ['Tom', 'Alice', 'Ben', 'Mia'];
const inputCls = "w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}{required && <span className="text-destructive ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

export default function AddRepairPage({ onSave, onBack, jobCount }: Props) {
  const [saved, setSaved] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [savedJob, setSavedJob] = useState<RepairJob | null>(null);
  const newJobNumber = `MR-2025-${String(jobCount + 1).padStart(3, '0')}`;

  const [form, setForm] = useState({
    customerName: '', phone: '', device: 'โทรศัพท์มือถือ' as DeviceType,
    brand: '', model: '', serialNumber: '', problem: '',
    estimatedCost: '', warrantyDays: '30', technician: '', technicianNote: '',
  });

  const set = (k: keyof typeof form) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const valid =
  Boolean(form.customerName.trim()) &&
  Boolean(form.phone.trim()) &&
  Boolean(form.brand.trim()) &&
  Boolean(form.model.trim()) &&
  Boolean(form.problem.trim());

  const handleSave = () => {
    if (!valid) return;
    const today = new Date().toISOString().split('T')[0];
    const wDays = parseInt(form.warrantyDays) || 0;
    const expiry = wDays > 0 ? new Date(Date.now() + wDays * 86400000).toISOString().split('T')[0] : '';
    const token = `QR-${newJobNumber.replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const job: RepairJob = {
      id: `J${Date.now()}`, jobNumber: newJobNumber, customerId: '',
      customerName: form.customerName, phone: form.phone, device: form.device,
      brand: form.brand, model: form.model, serialNumber: form.serialNumber,
      problem: form.problem, diagnosis: '', repairDetail: '',
      status: 'รับเครื่อง',
      statusHistory: [{ status: 'รับเครื่อง', note: 'รับเครื่องแล้ว', by: 'Staff', at: `${today} ${new Date().toTimeString().slice(0, 5)}` }],
      createdAt: today, updatedAt: today,
      estimatedCost: parseFloat(form.estimatedCost) || 0, actualCost: 0,
      technician: form.technician, warrantyDays: wDays,
      warrantyExpiry: expiry, hasWarranty: wDays > 0, qrToken: token,
    };
    onSave(job);
    setSavedJob(job);
    setSaved(true);
  };

  if (saved && savedJob) {
    return (
      <div className="p-4 lg:p-6 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">บันทึกงานเรียบร้อย!</h2>
          <p className="text-sm text-muted-foreground mb-1">เลขงาน <strong className="text-primary">{savedJob.jobNumber}</strong></p>
          <p className="text-sm text-muted-foreground mb-5">{savedJob.customerName} — {savedJob.brand} {savedJob.model}</p>

          {showQR && (
            <div className="mb-5 p-4 bg-muted rounded-2xl flex flex-col items-center gap-3">
              <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
                <QRCode value={`MINIREPAIR:${savedJob.jobNumber}:${savedJob.qrToken}`} size={180} fgColor="#0F172A" />
              </div>
              <p className="text-xs text-muted-foreground">ลูกค้าสแกนเพื่อติดตามงานซ่อม</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setShowQR(s => !s)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              <QrCode className="w-4 h-4" />{showQR ? 'ซ่อน QR' : 'สร้าง QR Code'}
            </button>
            <button className="flex items-center gap-2 bg-muted border border-border text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/70 transition-colors">
              <Printer className="w-4 h-4" />พิมพ์ใบรับ
            </button>
            <button onClick={onBack} className="border border-border text-muted-foreground px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
              กลับรายการ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-lg font-bold text-foreground">เพิ่มงานซ่อมใหม่</h2>
            <p className="text-xs text-muted-foreground">เลขงาน: <strong>{newJobNumber}</strong></p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ข้อมูลลูกค้า</div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="ชื่อลูกค้า" required><input value={form.customerName} onChange={set('customerName')} placeholder="ชื่อ-นามสกุล" className={inputCls} /></Field>
              <Field label="เบอร์โทรศัพท์" required><input value={form.phone} onChange={set('phone')} placeholder="081-234-5678" className={inputCls} /></Field>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ข้อมูลอุปกรณ์</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="ประเภท" required><select value={form.device} onChange={set('device')} className={inputCls}>{deviceTypes.map(d => <option key={d} value={d}>{d}</option>)}</select></Field>
              <Field label="ยี่ห้อ" required><input value={form.brand} onChange={set('brand')} placeholder="เช่น Apple" className={inputCls} /></Field>
              <Field label="รุ่น" required><input value={form.model} onChange={set('model')} placeholder="เช่น iPhone 15" className={inputCls} /></Field>
            </div>
            <Field label="ซีเรียลนัมเบอร์"><input value={form.serialNumber} onChange={set('serialNumber')} placeholder="ไม่บังคับ" className={inputCls} /></Field>
            <Field label="อาการเสีย" required>
              <textarea value={form.problem} onChange={set('problem')} placeholder="อธิบายอาการเสียให้ละเอียด..." rows={3} className={inputCls + ' resize-none'} />
            </Field>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">รายละเอียดการซ่อม</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="ราคาประเมิน (฿)"><input value={form.estimatedCost} onChange={set('estimatedCost')} type="number" placeholder="0" className={inputCls} /></Field>
              <Field label="ระยะรับประกัน"><select value={form.warrantyDays} onChange={set('warrantyDays')} className={inputCls}><option value="0">ไม่มีประกัน</option><option value="30">30 วัน</option><option value="60">60 วัน</option><option value="90">90 วัน</option></select></Field>
              <Field label="ช่างซ่อม"><select value={form.technician} onChange={set('technician')} className={inputCls}><option value="">ยังไม่มอบหมาย</option>{technicians.map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
            </div>
            <Field label="หมายเหตุ (ภายใน)">
              <textarea value={form.technicianNote} onChange={set('technicianNote')} placeholder="หมายเหตุสำหรับช่าง..." rows={2} className={inputCls + ' resize-none'} />
            </Field>
          </div>

          <div className="flex gap-2 justify-end pb-6">
            <button onClick={onBack} className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted">ยกเลิก</button>
            <button onClick={handleSave} disabled={!valid} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 shadow-sm">
              <Save className="w-4 h-4" />บันทึก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
