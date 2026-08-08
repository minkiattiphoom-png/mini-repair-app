import { QrCode, Smartphone, Search, ShieldCheck, ClipboardList, Settings, Award, Heart, MapPin, Calendar, Clock, ChevronRight, Home, Truck } from 'lucide-react';
import MiniRepairLogo from "../components/MiniRepairLogo";
interface Props {
  onScanQR: () => void;
  onCheckStatus: () => void;
  onGoAdmin: () => void;
  onCheckWarranty: () => void;
  onAdminLogin: () => void;
}

const features = [
  { icon: ShieldCheck, title: 'ตรวจเช็กก่อนซ่อม', desc: 'ตรวจเช็กอาการเสียอย่างละเอียดก่อนซ่อมทุกครั้ง', color: '#2563EB' },
  { icon: ClipboardList, title: 'แจ้งราคาก่อนเสมอ', desc: 'ประเมินราคาชัดเจนก่อนดำเนินการซ่อม', color: '#2563EB' },
  { icon: Settings, title: 'ใช้อะไหล่คุณภาพ', desc: 'คัดสรรอะไหล่ที่มีคุณภาพได้มาตรฐาน', color: '#2563EB' },
  { icon: Award, title: 'รับประกันงานซ่อม', desc: 'รับประกันงานซ่อมนานสูงสุด 3 เดือน', color: '#2563EB' },
  { icon: Heart, title: 'บริการด้วยใจ', desc: 'ใส่ใจลูกค้าทุกขั้นตอน บริการเป็นกันเอง', color: '#2563EB' },
];

export default function HomePage({ onScanQR, onCheckStatus, onGoAdmin }: Props) {
  return (
    <div className="min-h-screen font-[Sarabun,sans-serif]" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 30%, #EFF6FF 60%, #F8FAFC 100%)' }}>

     <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
  <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">

    {/* Logo + Text */}
    <div className="flex items-center gap-2">
      <MiniRepairLogo size={38} />

      <div className="leading-none">
        <div className="font-bold text-primary text-base">
          มินิซ่อม
        </div>

        <div className="text-muted-foreground tracking-widest text-[10px] mt-1">
          MINI REPAIR
        </div>
      </div>
    </div>
          <button
            onClick={onGoAdmin}
            className="text-xs text-muted-foreground border border-border px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
          >
            เข้าระบบ
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pb-0">

        {/* Hero */}
        <div className="text-center pt-8 pb-6">
          <div className="flex justify-center mb-2">
            <MiniRepairLogo size={200} />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground leading-tight">
            ซ่อมด้วยใจ <span className="text-primary">งานมีคุณภาพ</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">บริการดัวยรอยยิ้ม</p>
        </div>

        {/* QR Code Card — primary CTA */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-5">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-primary">สแกน QR Code</h2>
            <p className="text-sm text-muted-foreground mt-0.5">เพื่อดูข้อมูลอาการเสียและประกันงาน</p>
          </div>

          {/* Big QR tap area */}
          <button
            onClick={onScanQR}
            className="w-full flex flex-col items-center gap-2 group"
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-blue-700 flex flex-col items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <QrCode className="w-16 h-16 text-white" strokeWidth={1.5} />
              <span className="text-white text-xs font-medium mt-1">แตะเพื่อสแกน</span>
            </div>
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Smartphone className="w-4 h-4 flex-shrink-0" />
              <span>เปิดกล้องแล้วสแกน QR Code ที่ได้รับจากร้าน</span>
          </div>
        </div>

        {/* Quick check status */}
        <button
          onClick={onCheckStatus}
          className="w-full flex items-center justify-between bg-primary text-white px-5 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:bg-primary/90 transition-colors mb-8"
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5" />
            <div className="text-left">
              <div className="font-bold">ตรวจสอบงานซ่อม</div>
              <div className="text-blue-200 text-xs font-normal">ค้นหาด้วยเลขงาน หรือเบอร์โทร</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 opacity-70" />
        </button>

        {/* Why Mini Repair section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-center text-foreground mb-4">
            ทำไมต้อง <span className="text-primary">มินิซ่อม?</span>
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-blue-100 flex items-center justify-center mb-2 hover:shadow-md transition-shadow">
                  <Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>
          {/* Descriptions below on mobile */}
          <div className="mt-4 space-y-1 sm:hidden">
            {features.map(({ title, desc }) => (
              <div key={title} className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground whitespace-nowrap">{title}:</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Home Service Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-white p-5 flex gap-4 items-center">
            {/* Illustration placeholder */}
            <div className="flex-shrink-0 w-28 h-24 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Home className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-3 w-12 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-primary text-base leading-tight">
                บริการตรวจเช็กถึงบ้าน ฟรี!
              </h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-sm text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="font-medium">พื้นที่ รังสิต-ปทุมธานี</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>ทุกเสาร์-อาทิตย์</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>08.00 – 18.30 น.</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">* เงื่อนไขเป็นไปตามที่ร้านกำหนด</p>
            </div>
          </div>
        </div>

        </div>

      {/* Footer */}
      <footer className="bg-primary text-white py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
        <p className="font-bold text-base">ขอบคุณที่ไว้วางใจ มินิซ่อม</p>
        <p className="text-blue-200 text-sm mt-0.5">เราพร้อมดูแลอุปกรณ์ของคุณด้วยความใส่ใจ</p>
      </footer>
    </div>
  );
}
