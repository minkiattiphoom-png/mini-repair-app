import { ArrowLeft, QrCode } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export default function QRScannerPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold">
            สแกน QR Code
          </h1>
        </div>

        {/* Scanner area */}
        <div className="px-4 pt-10 text-center">

          <div className="relative w-full aspect-square max-w-sm mx-auto rounded-3xl border-2 border-white/40 overflow-hidden flex items-center justify-center">

            <QrCode className="w-32 h-32 text-white/80" strokeWidth={1} />

            {/* Scan frame */}
            <div className="absolute inset-12 border-2 border-blue-400 rounded-2xl" />

          </div>

          <h2 className="text-lg font-semibold mt-8">
            สแกน QR Code ของงานซ่อม
          </h2>

          <p className="text-sm text-white/60 mt-2">
            นำ QR Code ที่ได้รับจากร้าน
            มาไว้ในกรอบเพื่อสแกน
          </p>

        </div>

      </div>
    </div>
  );
}