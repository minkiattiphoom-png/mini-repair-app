import { useState } from 'react';
import { Search, ArrowLeft, Smartphone, Laptop, Monitor, Tablet, Tv, Wrench, AlertCircle, CheckCircle, ClipboardList, Settings, Award, Package } from 'lucide-react';
import type { RepairJob, RepairStatus } from '../types';
import MiniRepairLogo from '../components/MiniRepairLogo';
import StatusBadge from '../components/StatusBadge';

interface Props { jobs: RepairJob[]; onBack: () => void; initialJobId?: string }

const deviceIcons: Record<string, React.ElementType> = {
  'โทรศัพท์มือถือ': Smartphone, 'โน้ตบุ๊ก': Laptop,
  'คอมพิวเตอร์': Monitor, 'แท็บเล็ต': Tablet, 'โทรทัศน์': Tv,
};

const allSteps: RepairStatus[] = [
  'รับเครื่อง', 'ตรวจสอบ', 'เสนอราคา', 'รออนุมัติ', 'กำลังซ่อม', 'ทดสอบ', 'ซ่อมเสร็จ', 'รับเครื่องแล้ว',
];

const stepIcons: Record<RepairStatus, React.ElementType> = {
  'รับเครื่อง': CheckCircle, 'ตรวจสอบ': Search, 'เสนอราคา': ClipboardList,
  'รออนุมัติ': AlertCircle, 'กำลังซ่อม': Wrench, 'ทดสอบ': Settings,
  'ซ่อมเสร็จ': Award, 'รับเครื่องแล้ว': Package,
};

export default function StatusPage({ jobs, onBack, initialJobId }: Props) {
  const [query, setQuery] = useState(initialJobId ?? '');
  const [result, setResult] = useState<RepairJob | null | 'not-found'>(
    initialJobId ? (jobs.find(j => j.jobNumber === initialJobId || j.qrToken === initialJobId) ?? 'not-found') : null
  );
  const [searched, setSearched] = useState(!!initialJobId);

  const handleSearch = () => {
    const q = query.trim();
    const found = jobs.find(j =>
      j.jobNumber.toLowerCase() === q.toLowerCase() ||
      j.phone.replace(/-/g, '') === q.replace(/-/g, '') ||
      j.qrToken === q
    );
    setResult(found ?? 'not-found');
    setSearched(true);
  };

  const currentStepIdx = result && result !== 'not-found'
    ? allSteps.indexOf(result.status) : -1;

  const DeviceIcon = result && result !== 'not-found' ? (deviceIcons[result.device] ?? Wrench) : Wrench;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MiniRepairLogo size={28} />
          <span className="text-sm text-muted-foreground">/ ตรวจสอบงานซ่อม</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground">ตรวจสอบสถานะงานซ่อม</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ใส่เลขงานหรือเบอร์โทรเพื่อตรวจสอบ</p>
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="เช่น MR-2025-001 หรือ 081-234-5678"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              ค้นหา
            </button>
          </div>
        </div>

        {/* Not found */}
        {searched && result === 'not-found' && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">ไม่พบข้อมูล</h3>
            <p className="text-sm text-muted-foreground">กรุณาตรวจสอบเลขงานหรือติดต่อร้าน</p>
          </div>
        )}

        {/* Result */}
        {result && result !== 'not-found' && (
          <div className="space-y-4">
            {/* Device card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <DeviceIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{result.brand} {result.model}</div>
                    <div className="text-xs text-muted-foreground">{result.device}</div>
                  </div>
                </div>
                <StatusBadge status={result.status} />
              </div>

            <div className="space-y-2 text-sm">
          {[
            ['เลขงาน', result.jobNumber],
            ['ชื่อลูกค้า', result.customerName],
            ['อาการเสีย', result.problem],
            ['วันที่รับเครื่อง', result.createdAt],
            [
      'ราคาประเมิน',
      result.estimatedCost > 0
        ? `฿${result.estimatedCost.toLocaleString()}`
        : 'รอแจ้งราคา',
    ],
    result.actualCost > 0
      ? ['ราคาซ่อมจริง', `฿${result.actualCost.toLocaleString()}`]
      : null,
    result.warrantyExpiry
      ? ['ประกันงานซ่อม', `ถึง ${result.warrantyExpiry}`]
      : null,
  ]
    .filter(
      (item): item is [string, string] => item !== null
    )
    .map(([lbl, val]) => (
      <div key={lbl} className="flex gap-2">
        <span className="text-muted-foreground w-28 flex-shrink-0 text-xs">
          {lbl}
        </span>
        <span className="font-medium text-foreground text-xs">
          {val}
        </span>
      </div>
    ))}
</div>

              {result.repairDetail && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-xs font-semibold text-primary mb-0.5">รายละเอียดการซ่อม</div>
                  <p className="text-sm text-foreground">{result.repairDetail}</p>
                </div>
              )}
            </div>

            {/* Status timeline */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 text-sm">ขั้นตอนการซ่อม</h3>
              <div className="space-y-0">
                {allSteps.map((step, i) => {
                  const done = i <= currentStepIdx;
                  const current = i === currentStepIdx;
                  const Icon = stepIcons[step];
                  const historyEntry = result.statusHistory.find(h => h.status === step);
                  return (
                    <div key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          current ? 'border-primary bg-primary text-white shadow-md shadow-primary/30' :
                          done ? 'border-primary bg-primary/10 text-primary' :
                          'border-border bg-muted text-muted-foreground'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {i < allSteps.length - 1 && (
                          <div className={`w-0.5 h-6 mt-0.5 ${done && i < currentStepIdx ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-sm font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                          {current && <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">ปัจจุบัน</span>}
                        </div>
                        {historyEntry && (
                          <div className="text-xs text-muted-foreground mt-0.5">{historyEntry.at}</div>
                        )}
                        {historyEntry?.note && (
                          <div className="text-xs text-muted-foreground italic mt-0.5">"{historyEntry.note}"</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick try */}
        {!searched && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">งานตัวอย่าง</div>
            {jobs.slice(0, 4).map(j => (
              <button key={j.id} onClick={() => { setQuery(j.jobNumber); setResult(j); setSearched(true); }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted rounded-xl transition-colors text-sm">
                <span className="font-medium text-foreground font-mono">{j.jobNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{j.brand} {j.model}</span>
                  <StatusBadge status={j.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
