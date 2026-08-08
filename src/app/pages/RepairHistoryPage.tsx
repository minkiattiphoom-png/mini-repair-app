interface Props {
  qrToken: string;
  onBack: () => void;
}

export default function RepairHistoryPage({
  qrToken,
  onBack,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">

        <button
          onClick={onBack}
          className="mb-6 text-sm text-blue-600"
        >
          ← กลับ
        </button>

        <h1 className="text-2xl font-bold">
          ประวัติงานซ่อม
        </h1>

        <p className="text-sm text-slate-500 mt-2">
          QR: {qrToken}
        </p>

      </div>
    </div>
  );
}