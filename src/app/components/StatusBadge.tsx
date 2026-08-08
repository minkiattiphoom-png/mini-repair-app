import type { RepairStatus } from '../types';

const config: Record<RepairStatus, { className: string; dot: string }> = {
  'รับเครื่อง':     { className: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  'ตรวจสอบ':       { className: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'เสนอราคา':      { className: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500' },
  'รออนุมัติ':     { className: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  'กำลังซ่อม':    { className: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  'ทดสอบ':         { className: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  'ซ่อมเสร็จ':    { className: 'bg-green-100 text-green-700',   dot: 'bg-green-500' },
  'รับเครื่องแล้ว': { className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

export default function StatusBadge({ status }: { status: RepairStatus }) {
  const { className, dot } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
