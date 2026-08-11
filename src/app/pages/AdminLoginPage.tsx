import { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import MiniRepairLogo from '../components/MiniRepairLogo';
import type { AdminUser } from '../types';
import { supabase } from '../../lib/supabase';

interface Props {
  onLogin: (user: AdminUser) => void;
  onBack: () => void;
}

export default function AdminLoginPage({
  onLogin,
  onBack,
}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');

    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Login error:', error);
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError('ไม่สามารถเข้าสู่ระบบได้');
      setLoading(false);
      return;
    }

    onLogin({
      name:
        data.user.user_metadata?.name ||
        data.user.email?.split('@')[0] ||
        'Admin',
      role: 'admin',
      email: data.user.email || email.trim(),
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-8">

      {/* Back */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
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

          <h1 className="text-2xl font-bold text-white">
            Admin Only
          </h1>

          <p className="text-slate-400 text-sm mt-1">
            มินิซ่อม — Mini Repair
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 shadow-2xl">

          <h2 className="font-bold text-white mb-5 text-center">
            เข้าสู่ระบบ
          </h2>

          <div className="space-y-3">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                อีเมล
              </label>

              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="อีเมลของคุณ"
                  autoComplete="email"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                รหัสผ่าน
              </label>

              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />

                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin();
                    }
                  }}
                  placeholder="รหัสผ่าน"
                  autoComplete="current-password"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="text-slate-400 hover:text-white"
                  aria-label={
                    showPass
                      ? 'ซ่อนรหัสผ่าน'
                      : 'แสดงรหัสผ่าน'
                  }
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-400 text-xs text-center py-1">
                {error}
              </p>
            )}

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  เข้าสู่ระบบ
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}