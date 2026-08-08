import { useState } from 'react';
import { Search, ShieldCheck, ShieldX, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { RepairJob } from '../types';

interface Props {
  jobs: RepairJob[];
}

export default function WarrantyAdminPage({ jobs }: Props) {
  const [search, setSearch] = useState('');
  const [qrJob, setQrJob] = useState<RepairJob | null>(null);

  // เก็บเวลาปัจจุบันครั้งเดียวตอน component เริ่มทำงาน
  const [now] = useState(() => Date.now());
  const today = new Date(now).toISOString().split('T')[0];

  const warrantyJobs = jobs.filter(j => j.hasWarranty);

  const filtered = warrantyJobs.filter(
    j =>
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.includes(search)
  );

  const active = warrantyJobs.filter(
    j => j.warrantyExpiry >= today
  ).length;

  const expired = warrantyJobs.filter(
    j => j.warrantyExpiry < today
  ).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          จัดการประกันงานซ่อม
        </h1>
        <p className="text-sm text-muted-foreground">
          {warrantyJobs.length} งานที่มีประกัน
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['ทั้งหมด', warrantyJobs.length, 'bg-blue-50 text-blue-700'],
          ['ยังอยู่ในประกัน', active, 'bg-green-50 text-green-700'],
          ['หมดแล้ว', expired, 'bg-red-50 text-red-700'],
        ].map(([l, v, cls]) => (
          <div
            key={l as string}
            className={`${cls} rounded-2xl p-4 text-center border border-border`}
          >
            <div className="text-2xl font-bold">{v}</div>
            <div className="text-sm font-medium mt-0.5">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาเลขงานหรือชื่อลูกค้า..."
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {[
                  'เลขงาน',
                  'ลูกค้า',
                  'อุปกรณ์',
                  'วันซ่อม',
                  'หมดอายุ',
                  'สถานะ',
                  'QR',
                ].map(h => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map(job => {
                const isActive = job.warrantyExpiry >= today;

                const daysLeft = Math.ceil(
                  (new Date(job.warrantyExpiry).getTime() - now) /
                    86400000
                );

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">
                      {job.jobNumber}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">
                        {job.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {job.phone}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground text-sm">
                      {job.brand} {job.model}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {job.updatedAt}
                    </td>

                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {job.warrantyExpiry}
                    </td>

                    <td className="px-4 py-3.5">
                      {isActive ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          เหลือ {daysLeft} วัน
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                          <ShieldX className="w-3.5 h-3.5" />
                          หมดแล้ว
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() =>
                          setQrJob(
                            qrJob?.id === job.id ? null : job
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {qrJob && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setQrJob(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-foreground mb-0.5">
              {qrJob.jobNumber}
            </h3>

            <p className="text-sm text-muted-foreground mb-4">
              {qrJob.customerName}
            </p>

            <div className="flex justify-center p-3 bg-white border border-border rounded-xl mb-4">
              <QRCode
                value={`https://mini-repair-app.vercel.app/?job=${encodeURIComponent(qrJob.jobNumber)}`}
                    size={180}
                    fgColor="#0F172A"
                />
            </div>

            <button
              onClick={() => setQrJob(null)}
              className="w-full bg-muted border border-border text-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-muted/70"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}