import { LayoutDashboard, ClipboardList, Users, ShieldCheck, BarChart2, Settings, QrCode, X, ChevronRight, Globe } from 'lucide-react';
import type { AdminPage, UserRole } from '../types';
import MiniRepairLogo from './MiniRepairLogo';

interface Props {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onGoPublic: () => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
}

const navItems: { page: AdminPage; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { page: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, roles: ['admin', 'staff', 'technician'] },
  { page: 'repairs',   label: 'งานซ่อม',   icon: ClipboardList,   roles: ['admin', 'staff', 'technician'] },
  { page: 'customers', label: 'ลูกค้า',     icon: Users,           roles: ['admin', 'staff'] },
  { page: 'qrcode',    label: 'QR Code',    icon: QrCode,          roles: ['admin', 'staff'] },
  { page: 'warranty',  label: 'ประกันงาน', icon: ShieldCheck,     roles: ['admin', 'staff'] },
  { page: 'reports',   label: 'รายงาน',    icon: BarChart2,       roles: ['admin'] },
  { page: 'settings',  label: 'ตั้งค่า',   icon: Settings,        roles: ['admin'] },
];

const roleBadge: Record<UserRole, { label: string; cls: string }> = {
  admin:      { label: 'เจ้าของร้าน', cls: 'bg-blue-500/20 text-blue-300' },
  staff:      { label: 'พนักงาน',     cls: 'bg-green-500/20 text-green-300' },
  technician: { label: 'ช่าง',        cls: 'bg-amber-500/20 text-amber-300' },
};

export default function Sidebar({ currentPage, onNavigate, onGoPublic, isOpen, onClose, userRole }: Props) {
  const visibleItems = navItems.filter(n => n.roles.includes(userRole));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-60 bg-sidebar text-sidebar-foreground z-50 flex flex-col
        transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <MiniRepairLogo size={36} />
            </div>
            <div>
              <div className="font-bold text-sm text-white leading-none">มินิซ่อม</div>
              <div className="text-[10px] text-slate-400 mt-0.5 tracking-widest">MINI REPAIR</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page
              || (currentPage === 'add-repair' && page === 'repairs')
              || (currentPage === 'repair-detail' && page === 'repairs')
              || (currentPage === 'customer-profile' && page === 'customers');
            return (
              <button
                key={page}
                onClick={() => { onNavigate(page); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'text-slate-400 hover:bg-sidebar-accent hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          <button
            onClick={() => { onGoPublic(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-sidebar-accent hover:text-white transition-all"
          >
            <Globe className="w-4 h-4" />
            หน้าลูกค้า
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">ผู้ดูแลระบบ</div>
              <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 ${roleBadge[userRole].cls}`}>
                {roleBadge[userRole].label}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
