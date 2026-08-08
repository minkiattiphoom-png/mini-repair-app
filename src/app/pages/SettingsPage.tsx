import { useState } from 'react';
import { Save, Building2, Bell, ShieldCheck, Users } from 'lucide-react';

const inputCls = "w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && (
          <div className="text-xs text-muted-foreground mt-1">
            {desc}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${
          value
            ? "bg-primary"
            : "bg-muted border border-border"
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [shop, setShop] = useState({ name: 'มินิซ่อม', phone: '081-234-5678', line: '@minirepair', facebook: 'fb.com/minirepair', address: 'รังสิต ปทุมธานี 12110' });
  const [notif, setNotif] = useState({ lineOnComplete: true, smsOnComplete: false, weeklyReport: false });
  const [saved, setSaved] = useState(false);

  const set = (k: keyof typeof shop) => (e: React.ChangeEvent<HTMLInputElement>) => setShop(s => ({ ...s, [k]: e.target.value }));
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-2xl">
      <div><h2 className="text-xl font-bold text-foreground">ตั้งค่า</h2><p className="text-sm text-muted-foreground">จัดการข้อมูลและการตั้งค่าของร้าน</p></div>

      <Section icon={Building2} title="ข้อมูลร้าน">
        <div className="grid sm:grid-cols-2 gap-4">
          {([['ชื่อร้าน', 'name', 'มินิซ่อม'], ['เบอร์โทร', 'phone', '081-234-5678'], ['LINE OA', 'line', '@minirepair'], ['Facebook', 'facebook', 'fb.com/minirepair']] as const).map(([label, key, ph]) => (
            <div key={key}><label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label><input value={shop[key]} onChange={set(key)} placeholder={ph} className={inputCls} /></div>
          ))}
          <div className="sm:col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1.5">ที่อยู่ร้าน</label><input value={shop.address} onChange={set('address')} className={inputCls} /></div>
        </div>
      </Section>

      <Section icon={Bell} title="การแจ้งเตือน">
        <Toggle label="แจ้งเตือน LINE เมื่อซ่อมเสร็จ" desc="ส่งข้อความ LINE ให้ลูกค้าเมื่อซ่อมเสร็จ" value={notif.lineOnComplete} onChange={v => setNotif(n => ({ ...n, lineOnComplete: v }))} />
        <Toggle label="แจ้งเตือน SMS เมื่อซ่อมเสร็จ" desc="ส่ง SMS ให้ลูกค้า" value={notif.smsOnComplete} onChange={v => setNotif(n => ({ ...n, smsOnComplete: v }))} />
        <Toggle label="รายงานรายสัปดาห์" desc="รับสรุปงานทุกวันจันทร์" value={notif.weeklyReport} onChange={v => setNotif(n => ({ ...n, weeklyReport: v }))} />
      </Section>

      <Section icon={ShieldCheck} title="ค่าเริ่มต้นการรับประกัน">
        <div className="grid sm:grid-cols-2 gap-4">
          {[['ระยะรับประกันเริ่มต้น (วัน)', '30'], ['ระยะรับประกันสูงสุด (วัน)', '90']].map(([label, defaultVal]) => (
            <div key={label}><label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label><input type="number" defaultValue={defaultVal} className={inputCls} /></div>
          ))}
        </div>
      </Section>

      <Section icon={Users} title="ทีมช่าง">
        <div className="space-y-2">
          {[['Tom', 'หัวหน้าช่าง'], ['Alice', 'ช่างอาวุโส'], ['Ben', 'ช่าง'], ['Mia', 'ช่าง']].map(([name, role]) => (
            <div key={name} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">{name[0]}</div>
                <div><div className="text-sm font-medium text-foreground">{name}</div><div className="text-xs text-muted-foreground">{role}</div></div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">ใช้งานอยู่</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end pb-6">
        <button onClick={save} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
          <Save className="w-4 h-4" />{saved ? 'บันทึกแล้ว!' : 'บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  );
}
