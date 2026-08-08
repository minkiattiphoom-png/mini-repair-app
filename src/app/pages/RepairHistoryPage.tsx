import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Tv,
  Wrench,
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Settings,
  Award,
  Package,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

interface RepairJob {
  id: string;
  job_number: string;
  qr_token: string;
  customer_name: string;
  phone: string;
  device: string;
  brand: string;
  model: string;
  problem: string;
  repair_detail: string | null;
  status: string;
  estimated_cost: number | null;
  actual_cost: number | null;
  warranty_expiry: string | null;
  created_at: string;
  updated_at: string;
}

const deviceIcons: Record<string, React.ElementType> = {
  'โทรศัพท์มือถือ': Smartphone,
  'โน้ตบุ๊ก': Laptop,
  'คอมพิวเตอร์': Monitor,
  'แท็บเล็ต': Tablet,
  'โทรทัศน์': Tv,
};

const statusIcons: Record<string, React.ElementType> = {
  'รับเครื่อง': CheckCircle,
  'ตรวจสอบ': Settings,
  'เสนอราคา': ClipboardList,
  'รออนุมัติ': AlertCircle,
  'กำลังซ่อม': Wrench,
  'ทดสอบ': Settings,
  'ซ่อมเสร็จ': Award,
  'รับเครื่องแล้ว': Package,
};

export default function RepairHistoryPage({
  qrToken,
  onBack,
}: {
  qrToken: string;
  onBack: () => void;
}) {
  const [job, setJob] = useState<RepairJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const loadRepairJob = async () => {
    if (!qrToken) {
      setError('ไม่พบ QR Code');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('repair_jobs')
      .select('*')
      .eq('qr_token', qrToken)
      .maybeSingle();

    if (error) {
      console.error('Load repair job error:', error);
      setError('ไม่พบข้อมูลงานซ่อม');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('ไม่พบข้อมูลงานซ่อม');
      setLoading(false);
      return;
    }

    setJob(data);
    setLoading(false);
  };

  loadRepairJob();
}, [qrToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">
            กำลังโหลดข้อมูล...
          </p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-blue-600 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>

          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />

            <h1 className="text-xl font-bold text-slate-800">
              ไม่พบข้อมูลงานซ่อม
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              กรุณาตรวจสอบ QR Code อีกครั้ง
            </p>
          </div>
        </div>
      </div>
    );
  }

  const DeviceIcon =
    deviceIcons[job.device] ?? Wrench;

  const StatusIcon =
    statusIcons[job.status] ?? Settings;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-lg mx-auto">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            ประวัติงานซ่อม
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            เลขงาน {job.job_number}
          </p>
        </div>

        {/* Device */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">
          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <DeviceIcon className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <div className="font-bold text-slate-800">
                {job.brand} {job.model}
              </div>

              <div className="text-xs text-slate-500">
                {job.device}
              </div>
            </div>

          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">

          <div className="text-xs text-slate-500 mb-2">
            สถานะงาน
          </div>

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <StatusIcon className="w-5 h-5 text-blue-600" />
            </div>

            <div className="font-bold text-blue-600">
              {job.status}
            </div>

          </div>
        </div>

        {/* Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">

          <h2 className="font-bold text-slate-800 mb-4">
            รายละเอียดงาน
          </h2>

          <div className="space-y-3 text-sm">

            <div>
              <div className="text-xs text-slate-400">
                อาการเสีย
              </div>

              <div className="text-slate-800">
                {job.problem}
              </div>
            </div>

            {job.repair_detail && (
              <div>
                <div className="text-xs text-slate-400">
                  รายละเอียดการซ่อม
                </div>

                <div className="text-slate-800">
                  {job.repair_detail}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs text-slate-400">
                วันที่รับเครื่อง
              </div>

              <div className="text-slate-800">
                {job.created_at}
              </div>
            </div>

          </div>
        </div>

        {/* Cost */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border mb-4">

          <h2 className="font-bold text-slate-800 mb-4">
            ค่าใช้จ่าย
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-500">
                ราคาประเมิน
              </span>

              <span className="font-semibold">
                {Number(job.estimated_cost ?? 0) > 0
                  ? `฿${Number(job.estimated_cost).toLocaleString()}`
                  : 'รอแจ้งราคา'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                ราคาซ่อมจริง
              </span>

              <span className="font-semibold">
                {Number(job.actual_cost ?? 0) > 0
                  ? `฿${Number(job.actual_cost).toLocaleString()}`
                  : 'ยังไม่มีข้อมูล'}
              </span>
            </div>

          </div>
        </div>

        {/* Warranty */}
        {job.warranty_expiry && (
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">

            <div className="text-sm font-bold text-blue-700">
              ประกันงานซ่อม
            </div>

            <div className="text-sm text-blue-600 mt-1">
              รับประกันถึง {job.warranty_expiry}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}