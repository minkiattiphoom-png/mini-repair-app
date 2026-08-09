import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onBack: () => void;
  onScan: (value: string) => void;
}

export default function QRScannerPage({ onBack, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        setError(null);

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },
          (decodedText) => {
            if (hasScannedRef.current) return;
              hasScannedRef.current = true;
              onScan(decodedText);
            },
          () => {
            // อ่าน QR ไม่สำเร็จในเฟรมนี้
          }
        );

        setScanning(true);
      } catch {
        setError(
          'ไม่สามารถเปิดกล้องหลังได้ กรุณาอนุญาตการใช้กล้องแล้วลองใหม่'
        );
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, [onScan]);

  const handleBack = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ไม่ต้องทำอะไร
      }
    }

    onBack();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="กลับ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-lg font-bold">
            สแกน QR Code
          </h1>
        </div>

        {/* Scanner */}
        <div className="px-4 pt-6 text-center">

          <div className="relative w-full max-w-sm mx-auto overflow-hidden rounded-3xl bg-black">
            <div
              id="qr-reader"
              className="w-full"
            />
          </div>

          {scanning && !error && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Camera className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-white/80">
                กำลังเปิดกล้องหลัง...
              </span>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-400/30 rounded-2xl p-4">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />

              <p className="text-sm text-red-200">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-sm"
              >
                ลองใหม่
              </button>
            </div>
          )}

          {!error && (
            <>
              <h2 className="text-lg font-semibold mt-8">
                สแกน QR Code ของงานซ่อม
              </h2>

              <p className="text-sm text-white/60 mt-2">
                นำ QR Code ที่ได้รับจากร้าน
                มาไว้ในกรอบเพื่อสแกน
              </p>
            </>
          )}

        </div>

      </div>
    </div>
  );
}