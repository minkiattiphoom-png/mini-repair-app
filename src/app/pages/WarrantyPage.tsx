import { useState } from 'react';
import { Search, ArrowLeft, ShieldCheck, ShieldX, AlertCircle, Calendar, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { RepairJob } from '../types';
import MiniRepairLogo from '../components/MiniRepairLogo';

interface Props { jobs: RepairJob[]; onBack: () => void }

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function WarrantyPage({ jobs, onBack }: Props) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<RepairJob | null | 'not-found'>(null);
  const [searched, setSearched] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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

  const isActive = result && result !== 'not-found' && result.hasWarranty && result.warrantyExpiry >= today;
  const daysLeft = result && result !== 'not-found' && result.warrantyExpiry
    ? daysBetween(today, result.warrantyExpiry) : 0;
  const warrantyJobs = jobs.filter(j => j.hasWarranty);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 bg-white border-b border-border shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <MiniRepairLogo size={28} />
          <span className="text-sm text-muted-foreground">/ ตรวจสอบประกัน</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">ตรวจสอบการรับประกัน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ตรวจสอบสถานะประกันงานซ่อมของคุณ</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="เลขงาน หรือ เบอร์โทร"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-colors"
            >
              ตรวจสอบ
            </button>
          </div>
        </div>

        {searched && result === 'not-found' && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-foreground mb-1">ไม่พบข้อมูล</h3>
            <p className="text-sm text-muted-foreground">กรุณาตรวจสอบเลขงานหรือติดต่อร้าน</p>
          </div>
        )}

        {result && result !== 'not-found' && (
          <div className="space-y-4">
            {/* Status banner */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 ${isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-red-400'}`}>
                {isActive ? <ShieldCheck className="w-6 h-6 text-white" /> : <ShieldX className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${isActive ? 'text-green-700' : 'text-red-700'}`}>
                  {isActive ? '✅ ประกันยังอยู่ในระยะ' : result.hasWarranty ? '❌ ประกันหมดอายุแล้ว' : '⚠️ ไม่มีประกันงานซ่อม'}
                </div>
                {result.hasWarranty && result.warrantyExpiry ? (
                  <div className={`text-sm mt-0.5 ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {isActive ? `เหลือ ${daysLeft} วัน — หมดอายุ ${result.warrantyExpiry}` : `หมดอายุเมื่อ ${result.warrantyExpiry}`}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground mt-0.5">งานซ่อมนี้ไม่ครอบคลุมการรับประกัน</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Info */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
                <h3 className="font-semibold text-foreground text-sm mb-3">ข้อมูลงานซ่อม</h3>
                {[
                  ['เลขงาน', result.jobNumber],
                  ['ชื่อ', result.customerName],
                  ['อุปกรณ์', `${result.brand} ${result.model}`],
                  ['วันที่ซ่อม', result.updatedAt || result.createdAt],
                  ['ระยะประกัน', result.warrantyDays > 0 ? `${result.warrantyDays} วัน` : 'ไม่มี'],
                  ['หมดอายุ', result.warrantyExpiry || '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground w-24 flex-shrink-0 text-xs">{lbl}</span>
                    <span className="font-medium text-foreground text-xs">{val}</span>
                  </div>
                ))}

                {result.hasWarranty && isActive && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />ระยะประกัน
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.max(5, Math.min(100, (daysLeft / result.warrantyDays) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>0 วัน</span>
                      <span className="text-green-600 font-semibold">เหลือ {daysLeft} วัน</span>
                      <span>{result.warrantyDays} วัน</span>
                    </div>
                  </div>
                )}
              </div>

              {/* QR */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground self-start">
                  <QrCode className="w-4 h-4 text-primary" />QR ประกัน
                </div>
                <div className="p-2 bg-white border border-border rounded-xl shadow-sm">
                  <QRCode
                    value={`MINIREPAIR:WARRANTY:${result.jobNumber}:${result.warrantyExpiry || 'NONE'}`}
                    size={120}
                    fgColor="#0F172A"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center">สแกนเพื่อยืนยันการรับประกัน</p>
              </div>
            </div>
          </div>
        )}

        {!searched && (
          <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">งานที่มีประกัน</div>
            {warrantyJobs.map(j => (
              <button key={j.id} onClick={() => { setQuery(j.jobNumber); setResult(j); setSearched(true); }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted rounded-xl text-sm transition-colors">
                <span className="font-medium text-foreground font-mono">{j.jobNumber}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{j.brand} {j.model}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${j.warrantyExpiry >= today ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {j.warrantyExpiry >= today ? 'ยังอยู่ในประกัน' : 'หมดแล้ว'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
