import { Menu, Bell, Plus, LogOut } from 'lucide-react';
import type { AdminPage } from '../types';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  title: string;
  onMenuToggle: () => void;
  onNavigate: (page: AdminPage) => void;
  onLogout: () => void;
}

export default function TopBar({ title, onMenuToggle, onNavigate, onLogout }: Props) {
  const { canInstall, install } = usePWAInstall();
  {canInstall && (
  <button
    onClick={install}
    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
  >
    <Download className="w-4 h-4" />
    ติดตั้ง Admin
  </button>
)}
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 lg:px-5 gap-3 flex-shrink-0">
      <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground">
        <Menu className="w-5 h-5" />
      </button>
      <h1 className="font-semibold text-foreground flex-1">{title}</h1>

      <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
      </button>

      <button
        onClick={() => onNavigate('add-repair')}
        className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        งานใหม่
      </button>

      <button onClick={onLogout} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="ออกจากระบบ">
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  );
}
