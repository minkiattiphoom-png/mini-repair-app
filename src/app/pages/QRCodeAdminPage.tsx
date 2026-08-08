import { useState } from 'react';
import { Search, Download, Printer, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import type { RepairJob } from '../types';
import StatusBadge from '../components/StatusBadge';

interface Props {
  jobs: RepairJob[];
}

export default function QRCodeAdminPage({ jobs }: Props) {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(
    jobs[0] ?? null
  );

  const filtered = jobs.filter(
    (j) =>
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.includes(search) ||
      j.phone.includes(search)
  );

  /*
   * URL ที่จะถูกเก็บลงใน QR Code
   *
   * ตัวอย่าง:
   * http://localhost:5173/repair/MR-0001/abc123
   *
   * เมื่อเอาเว็บขึ้นจริง:
   * https://minirepair.com/repair/MR-0001/abc123
   */
  const qrValue = selectedJob
    ? `${window.location.origin}/repair/${encodeURIComponent(
        selectedJob.jobNumber
      )}/${encodeURIComponent(selectedJob.qrToken)}`
    : '';

  // ดาวน์โหลด QR เป็น PNG
  const handleDownload = () => {
    const svg = document.getElementById('repair-qr-code');

    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0, 1000, 1000);

      const link = document.createElement('a');
      link.download = `${selectedJob?.jobNumber}-QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(svgString);
  };

  // พิมพ์ QR
  const handlePrint = () => {
    if (!selectedJob) return;

    const printWindow = window.open('', '_blank', 'width=600,height=700');

    if (!printWindow) {
      alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาอนุญาต Popup ของเว็บไซต์');
      return;
    }

    const svg = document.getElementById('repair-qr-code');

    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />

          <title>QR Code - ${selectedJob.jobNumber}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            .container {
              width: 320px;
              margin: 0 auto;
            }

            .qr {
              background: white;
              padding: 20px;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
              margin: 20px auto;
              width: fit-content;
            }

            .job-number {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 6px;
            }

            .customer {
              font-size: 14px;
              color: #64748b;
            }

            .instruction {
              font-size: 13px;
              color: #64748b;
              margin-top: 15px;
            }

            .brand {
              font-size: 14px;
              font-weight: bold;
              color: #2563eb;
              margin-top: 5px;
            }

            .url {
              font-size: 9px;
              color: #94a3b8;
              word-break: break-all;
              margin-top: 15px;
            }

            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>

        <body>
          <div class="container">

            <div class="job-number">
              ${selectedJob.jobNumber}
            </div>

            <div class="customer">
              ${selectedJob.customerName}
              —
              ${selectedJob.brand} ${selectedJob.model}
            </div>

            <div class="qr">
              ${svgString}
            </div>

            <div class="instruction">
              สแกน QR Code เพื่อตรวจสอบสถานะงานซ่อม
            </div>

            <div class="brand">
              มินิซ่อม — MINI REPAIR
            </div>

            <div class="url">
              ${qrValue}
            </div>

          </div>

          <script>
            window.onload = function() {
              window.print();

              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">
          จัดการ QR Code
        </h2>

        <p className="text-sm text-muted-foreground">
          สร้าง ดาวน์โหลด และพิมพ์ QR Code สำหรับแต่ละงานซ่อม
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">

        {/* Left: job list */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">

              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหางานซ่อม..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />

            </div>
          </div>

          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">

            {filtered.map((job) => (

              <button
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${
                  selectedJob?.id === job.id
                    ? 'bg-blue-50 border-l-2 border-primary'
                    : ''
                }`}
              >

                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedJob?.id === job.id
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <QrCode
                    className={`w-4 h-4 ${
                      selectedJob?.id === job.id
                        ? 'text-white'
                        : 'text-muted-foreground'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">

                  <div className="font-mono text-xs font-bold text-primary">
                    {job.jobNumber}
                  </div>

                  <div className="text-sm font-medium text-foreground truncate">
                    {job.customerName}
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    {job.brand} {job.model}
                  </div>

                </div>

                <StatusBadge status={job.status} />

              </button>

            ))}

          </div>
        </div>

        {/* Right: QR preview */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center">

          {selectedJob ? (
            <>

              <div className="text-center mb-5">

                <h3 className="font-bold text-foreground">
                  {selectedJob.jobNumber}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {selectedJob.customerName} — {selectedJob.brand}{' '}
                  {selectedJob.model}
                </p>

                <div className="mt-2">
                  <StatusBadge status={selectedJob.status} />
                </div>

              </div>

              {/* QR Code */}
              <div className="p-5 bg-white border-2 border-border rounded-2xl shadow-md mb-4">

                <QRCode
                  id="repair-qr-code"
                  value={qrValue}
                  size={200}
                  fgColor="#0F172A"
                  bgColor="#FFFFFF"
                />

              </div>

              {/* Mini brand strip */}
              <div className="w-full max-w-[240px] text-center mb-5">

                <div className="text-xs text-muted-foreground">
                  สแกนเพื่อตรวจสอบสถานะงานซ่อม
                </div>

                <div className="text-xs font-bold text-primary mt-0.5">
                  มินิซ่อม — MINI REPAIR
                </div>

              </div>

              {/* URL */}
              <div className="w-full bg-muted rounded-xl p-3 text-center mb-3">

                <div className="text-xs text-muted-foreground mb-1">
                  QR URL
                </div>

                <div className="font-mono text-[10px] text-foreground break-all">
                  {qrValue}
                </div>

              </div>

              {/* Token */}
              <div className="w-full bg-muted rounded-xl p-3 text-center mb-5">

                <div className="text-xs text-muted-foreground mb-0.5">
                  QR Token
                </div>

                <div className="font-mono text-xs text-foreground break-all">
                  {selectedJob.qrToken}
                </div>

              </div>

              {/* Buttons */}
              <div className="flex gap-3 w-full">

                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  ดาวน์โหลด
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border text-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/70 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  พิมพ์
                </button>

              </div>

            </>
          ) : (

            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">

              <QrCode className="w-16 h-16 opacity-20 mb-3" />

              <p className="text-sm">
                เลือกงานซ่อมเพื่อดู QR Code
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}