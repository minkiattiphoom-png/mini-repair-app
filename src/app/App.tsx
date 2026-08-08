import { useState } from 'react';
import type { RepairJob, RepairStatus, AdminPage, AdminUser } from './types';
import { mockRepairJobs, mockCustomers } from './data';

import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

import HomePage from './pages/HomePage';
import StatusPage from './pages/StatusPage';
import WarrantyPage from './pages/WarrantyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import RepairsPage from './pages/RepairsPage';
import RepairDetailPage from './pages/RepairDetailPage';
import AddRepairPage from './pages/AddRepairPage';
import CustomersPage from './pages/CustomersPage';
import QRCodeAdminPage from './pages/QRCodeAdminPage';
import WarrantyAdminPage from './pages/WarrantyAdminPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

const pageTitles: Record<AdminPage, string> = {
  dashboard:          'แดชบอร์ด',
  repairs:            'งานซ่อม',
  'add-repair':       'รับงานซ่อมใหม่',
  'repair-detail':    'รายละเอียดงานซ่อม',
  customers:          'ลูกค้า',
  'customer-profile': 'โปรไฟล์ลูกค้า',
  qrcode:             'จัดการ QR Code',
  warranty:           'ประกันงานซ่อม',
  reports:            'รายงาน',
  settings:           'ตั้งค่า',
};

export default function App() {
  const urlJobNumber = new URLSearchParams(window.location.search).get('job');

  const [section, setSection] = useState<
    'public' | 'login' | 'admin'
  >('public');

  const [publicPage, setPublicPage] = useState<
    'home' | 'status' | 'warranty'
  >('home');

  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [jobs, setJobs] = useState<RepairJob[]>(mockRepairJobs);

  const [customers] = useState(mockCustomers);

  const statusJobId = urlJobNumber
    ? jobs.find(
        job =>
          job.jobNumber.toLowerCase() === urlJobNumber.toLowerCase()
      )?.id
    : undefined;

  const addJob = (job: RepairJob) => setJobs(prev => [job, ...prev]);

  const updateJobStatus = (id: string, status: RepairStatus) =>
    setJobs(prev => prev.map(j =>
      j.id === id
        ? {
            ...j,
            status,
            updatedAt: new Date().toISOString().split('T')[0],
            statusHistory: [
              ...j.statusHistory,
              { status, note: 'อัปเดตสถานะ', by: currentUser?.name ?? 'ระบบ', at: new Date().toLocaleString('th-TH') },
            ],
          }
        : j
    ));

  const deleteJob = (id: string) => setJobs(prev => prev.filter(j => j.id !== id));

  const handleLogin = (user: AdminUser) => {
    setCurrentUser(user);
    setSection('admin');
    setAdminPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSection('public');
    setPublicPage('home');
  };

  const goAdmin = () => setSection('login');
  const goPublic = () => { setSection('public'); setPublicPage('home'); };

  const goRepairDetail = (id: string) => {
    setSelectedJobId(id);
    setAdminPage('repair-detail');
  };

  // ── Public routes ──────────────────────────────────────────────────────────
    if (section === 'public') {
    if (publicPage === 'status') {
      return (
        <StatusPage
          jobs={jobs}
          onBack={() => setPublicPage('home')}
          initialJobId={statusJobId}
        />
      );
    }

    if (publicPage === 'warranty') {
      return (
        <WarrantyPage
          jobs={jobs}
          onBack={() => setPublicPage('home')}
        />
      );
    }

    return (
      <HomePage
        onCheckStatus={() => setPublicPage('status')}
        onCheckWarranty={() => setPublicPage('warranty')}
        onAdminLogin={goAdmin}
      />
    );
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (section === 'login') {
    return <AdminLoginPage onLogin={handleLogin} onBack={goPublic} />;
  }

  // ── Admin layout ───────────────────────────────────────────────────────────
  const userRole = currentUser?.role ?? 'admin';
  const selectedJob = selectedJobId ? jobs.find(j => j.id === selectedJobId) : null;

  const renderAdminPage = () => {
    switch (adminPage) {
      case 'dashboard':
        return <DashboardPage jobs={jobs} onNavigate={setAdminPage} />;

      case 'repairs':
        return (
          <RepairsPage
            jobs={jobs}
            onAddNew={() => setAdminPage('add-repair')}
            onUpdateStatus={updateJobStatus}
            onDeleteJob={deleteJob}
            onViewDetail={goRepairDetail}
          />
        );

      case 'repair-detail':
        return selectedJob
          ? <RepairDetailPage job={selectedJob} onBack={() => setAdminPage('repairs')} onUpdateStatus={updateJobStatus} />
          : <RepairsPage jobs={jobs} onAddNew={() => setAdminPage('add-repair')} onUpdateStatus={updateJobStatus} onDeleteJob={deleteJob} onViewDetail={goRepairDetail} />;

      case 'add-repair':
        return (
          <AddRepairPage
            onSave={job => { addJob(job); setAdminPage('repairs'); }}
            onBack={() => setAdminPage('repairs')}
            jobCount={jobs.length}
          />
        );

      case 'customers':
      case 'customer-profile':
        return <CustomersPage customers={customers} jobs={jobs} />;

      case 'qrcode':
        return <QRCodeAdminPage jobs={jobs} />;

      case 'warranty':
        return <WarrantyAdminPage jobs={jobs} />;

      case 'reports':
        return <ReportsPage jobs={jobs} />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <DashboardPage jobs={jobs} onNavigate={setAdminPage} />;
    }
  };

  const topTitle = adminPage === 'repair-detail' && selectedJob
    ? `${selectedJob.jobNumber} — ${selectedJob.customerName}`
    : pageTitles[adminPage];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        currentPage={adminPage}
        onNavigate={page => { setAdminPage(page); setSidebarOpen(false); }}
        onGoPublic={goPublic}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={topTitle}
          onMenuToggle={() => setSidebarOpen(s => !s)}
          onNavigate={setAdminPage}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-y-auto">
          {renderAdminPage()}
        </main>
      </div>
    </div>
  );
}
