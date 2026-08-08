import {
  ArrowLeft,
  Search,
  Wrench,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

import type { RepairJob, RepairStatus } from '../types';
import StatusBadge from '../components/StatusBadge';

interface Props {
  jobs?: RepairJob[];
  qrToken: string;
  jobNumber?: string;
  onBack: () => void;
}

const allSteps: RepairStatus[] = [
  'รับเครื่อง',
  'ตรวจสอบ',
  'เสนอราคา',
  'รออนุมัติ',
  'กำลังซ่อม',
  'ทดสอบ',
  'ซ่อมเสร็จ',
  'รับเครื่องแล้ว',
];

export default function RepairHistoryPage({
  jobs,
  qrToken,
  jobNumber,
  onBack,
}: Props) {
  const result = jobs?.find(
  job =>
    job.qrToken === qrToken &&
    (!jobNumber || job.jobNumber === jobNumber)
);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-6">

          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm text-blue-600"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับ
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-3" />

            <h1 className="text-xl font-bold text-slate-800">
              ไม่พบข้อมูลงานซ่อม
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              QR Code นี้ไม่พบข้อมูลในระบบ
            </p>
          </div>

        </div>
      </div>
    );
  }

  const currentStepIndex = allSteps.indexOf(result.status);

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Back */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm text-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับ
        </button>

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800">
            ประวัติงานซ่อม
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            ข้อมูลจาก QR Code
          </p>
        </div>

        {/* Job information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">

          <div className="flex items-start justify-between gap-3">

            <div>
              <div className="text-xs text-slate-500">
                เลขงาน
              </div>

              <div className="text-xl font-bold text-blue-600 font-mono">
                {result.jobNumber}
              </div>
            </div>

            <StatusBadge status={result.status} />

          </div>

          <div className="border-t border-slate-100 my-4" />

          <div className="space-y-3 text-sm">

            <div>
              <div className="text-xs text-slate-500">
                อุปกรณ์
              </div>

              <div className="font-semibold text-slate-800">
                {result.device}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                ยี่ห้อ / รุ่น
              </div>

              <div className="font-semibold text-slate-800">
                {result.brand} {result.model}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                อาการเสีย
              </div>

              <div className="font-semibold text-slate-800">
                {result.problem}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">
                วันที่รับเครื่อง
              </div>

              <div className="font-semibold text-slate-800">
                {result.createdAt}
              </div>
            </div>

          </div>
        </div>

        {/* Repair detail */}
        {result.repairDetail && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">

            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-5 h-5 text-blue-600" />

              <h2 className="font-bold text-slate-800">
                รายละเอียดการซ่อม
              </h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              {result.repairDetail}
            </p>

          </div>
        )}

        {/* Cost */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">

          <h2 className="font-bold text-slate-800 mb-4">
            ค่าใช้จ่าย
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-500">
                ราคาประเมิน
              </span>

              <span className="font-semibold">
                {result.estimatedCost > 0
                  ? `฿${result.estimatedCost.toLocaleString()}`
                  : 'รอแจ้งราคา'}
              </span>
            </div>

            {result.actualCost > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500">
                  ราคาซ่อมจริง
                </span>

                <span className="font-bold text-blue-600">
                  ฿{result.actualCost.toLocaleString()}
                </span>
              </div>
            )}

          </div>

        </div>

        {/* Warranty */}
        {result.warrantyExpiry && (
          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm mb-4">

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />

              <div>
                <div className="font-bold text-blue-800">
                  รับประกันงานซ่อม
                </div>

                <div className="text-sm text-blue-700 mt-1">
                  รับประกันถึง {result.warrantyExpiry}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Repair timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-blue-600" />

            <h2 className="font-bold text-slate-800">
              ประวัติการซ่อม
            </h2>
          </div>

          <div className="space-y-0">

            {allSteps.map((step, index) => {

              const completed = index <= currentStepIndex;
              const current = index === currentStepIndex;

              const history = result.statusHistory.find(
                item => item.status === step
              );

              return (
                <div
                  key={step}
                  className="flex gap-3"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                        current
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : completed
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </div>

                    {index < allSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          index < currentStepIndex
                            ? 'bg-blue-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    )}

                  </div>

                  <div className="flex-1 pb-5">

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          completed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>

                      {current && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          ปัจจุบัน
                        </span>
                      )}
                    </div>

                    {history && (
                      <div className="text-xs text-slate-500 mt-1">
                        {history.at}
                      </div>
                    )}

                    {history?.note && (
                      <div className="text-xs text-slate-500 mt-1">
                        {history.note}
                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}