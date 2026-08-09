import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ChevronRight, ArrowLeft } from 'lucide-react';
import MiniRepairLogo from '../components/MiniRepairLogo';
import type { AdminUser, UserRole } from '../types';

interface Props {
  onLogin: (user: AdminUser) => void;
  onBack: () => void;
}

const demoAccounts: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: 'admin@minirepair.co.th', password: '1234', name: 'เจ้าของร้าน', role: 'admin' },
  { email: 'staff@minirepair.co.th', password: '1234', name: 'พนักงาน', role: 'staff' },
  { email: 'tech@minirepair.co.th', password: '1234', name: 'ช่างซ่อม', role: 'technician' },
];

const roleLabels: Record<UserRole, string> = {
  admin: 'เจ้าของร้าน / Admin',
  staff: 'พนักงาน / Staff',
  technician: 'ช่าง / Technician',
};

const roleBg: Record<UserRole, string> = {
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700',
  technician: 'bg-amber-100 text-amber-700',
};

export default function AdminLoginPage({ onLogin, onBack }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const found = demoAccounts.find(a => a.email === email && a.password === password);
      if (found) {
        onLogin({ name: found.name, role: found.role, email: found.email });
      } else {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Back */}
      <button onClick={onBack} className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        กลับหน้าหลัก
      </button>

      {/* Card */}
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-[230px] h-[230px] bg-white rounded-full mb-4 shadow-xl">
            <MiniRepairLogo size={230} />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Only</h1>
          <p className="text-slate-400 text-sm mt-1">มินิซ่อม — Mini Repair</p>
        </div>

        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">
          <h2 className="font-bold text-white mb-5 text-center">เข้าสู่ระบบ</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="อีเมลของคุณ"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่าน</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="รหัสผ่าน"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />
                <button onClick={() => setShowPass(s => !s)} className="text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center py-1">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>เข้าสู่ระบบ <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-5">
          <p className="text-center text-xs text-slate-500 mb-3">บัญชีสำหรับทดสอบ</p>
          <div className="space-y-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => quickLogin(acc)}
                className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 transition-colors"
              >
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{acc.name}</div>
                  <div className="text-xs text-slate-400">{acc.email} / {acc.password}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${roleBg[acc.role]}`}>
                  {roleLabels[acc.role].split(' / ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
