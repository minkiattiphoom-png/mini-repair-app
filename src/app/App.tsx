import { useEffect, useState } from 'react';
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
import QRScannerPage from './pages/QRScannerPage';
import RepairHistoryPage from './pages/RepairHistoryPage';
import { supabase } from '../lib/supabase';

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
  
  const testSupabase = async () => {
  const { data, error } = await supabase
    .from('repair_jobs')
    .select('*')
    .limit(1);

  console.log('Supabase data:', data);
  console.log('Supabase error:', error);
};

  const [section, setSection] = useState<
    'public' | 'login' | 'admin'
  >('public');

  const [publicPage, setPublicPage] = useState<
  'home' | 'status' | 'warranty' | 'scanner' | 'history'
>('home');

  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [scannedQR, setScannedQR] = useState<string | null>(null);

  const [jobs, setJobs] = useState<RepairJob[]>(mockRepairJobs);

  useEffect(() => {
  const load = async () => {
    const { data, error } = await supabase
      .from('repair_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load jobs error:', error);
      return;
    }

    console.log('Jobs from Supabase:', data);

    if (!data) return;

    const mappedJobs: RepairJob[] = data.map(job => ({
      id: job.id,
      jobNumber: job.job_number,

      customerId: job.customer_id ?? '',
      customerName: job.customer_name ?? '',
      phone: job.phone ?? '',

      device: job.device,
      brand: job.brand ?? '',
      model: job.model ?? '',
      serialNumber: job.serial_number ?? '',

      problem: job.problem ?? '',
      diagnosis: job.diagnosis ?? '',
      repairDetail: job.repair_detail ?? '',

      status: job.status as RepairStatus,
      statusHistory: [],

      createdAt: job.created_at,
      updatedAt: job.updated_at,

      estimatedCost: Number(job.estimated_cost ?? 0),
      actualCost: Number(job.actual_cost ?? 0),

      technician: job.technician ?? '',

      warrantyDays: Number(job.warranty_days ?? 0),
      warrantyExpiry: job.warranty_expiry ?? '',
      hasWarranty: Boolean(job.has_warranty),

      qrToken: job.qr_token,
    }));

    setJobs(mappedJobs);
  };

  load();
}, []);
  const [customers] = useState(mockCustomers);

const addJob = async (job: RepairJob): Promise<boolean> => {
  const { data, error } = await supabase
    .from('repair_jobs')
    .insert({
      job_number: job.jobNumber,
      qr_token: job.qrToken,

      customer_name: job.customerName,
      phone: job.phone,

      device: job.device,
      brand: job.brand,
      model: job.model,
      serial_number: job.serialNumber,

      problem: job.problem,
      diagnosis: job.diagnosis,
      repair_detail: job.repairDetail,

      status: job.status,

      estimated_cost: job.estimatedCost,
      actual_cost: job.actualCost,

      technician: job.technician,

      warranty_days: job.warrantyDays,
      warranty_expiry: job.warrantyExpiry || null,
      has_warranty: job.hasWarranty,
    })
    .select()
    .single();

  if (error) {
    console.error('Create repair job error:', error);
    alert(`บันทึกงานไม่สำเร็จ: ${error.message}`);
    return false;
  }

  console.log('Created repair job:', data);

  const savedJob: RepairJob = {
    ...job,
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };

  setJobs(prev => [savedJob, ...prev]);

  return true;
};

// ⬇️ Update แก้ไขงานซ่อม
const updateRepairJob = async (
  job: RepairJob
): Promise<boolean> => {
  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from('repair_jobs')
    .update({
      problem: job.problem,
      diagnosis: job.diagnosis,
      repair_detail: job.repairDetail,
      estimated_cost: job.estimatedCost,
      actual_cost: job.actualCost,
      technician: job.technician,
      warranty_days: job.warrantyDays,
      warranty_expiry: job.warrantyExpiry || null,
      has_warranty: job.hasWarranty,
      updated_at: updatedAt,
    })
    .eq('id', job.id);

  if (error) {
    console.error('Update repair job error:', error);
    alert(`บันทึกการแก้ไขไม่สำเร็จ: ${error.message}`);
    return false;
  }

  const updatedJob: RepairJob = {
    ...job,
    updatedAt,
  };

  setJobs(prev =>
    prev.map(j =>
      j.id === job.id ? updatedJob : j
    )
  );

  return true;
};

  const pathname = window.location.pathname;
  const repairUrlMatch = pathname.match(
  /^\/repair\/([^/]+)\/([^/]+)$/
);

const urlJobNumber = repairUrlMatch?.[1] ?? null;
const urlQRToken = repairUrlMatch?.[2] ?? null;

  const updateJobStatus = async (
        id: string,
        status: RepairStatus
    ) => {
        const updatedAt = new Date().toISOString();
        const { data, error } = await supabase
          .from('repair_jobs')
          .update({
            status,
            updated_at: updatedAt,
          })
            .eq('id', id)
            .select()
            .single();

  if (error) {
    console.error('Update job status error:', error);
    alert(`อัปเดตสถานะไม่สำเร็จ: ${error.message}`);
    return false;
  }

  console.log('Updated job status:', data);

  setJobs(prev =>
    prev.map(j =>
      j.id === id
        ? {
            ...j,
            status,
            updatedAt,
            statusHistory: [
              ...j.statusHistory,
              {
                status,
                note: 'อัปเดตสถานะ',
                by: currentUser?.name ?? 'ระบบ',
                at: new Date().toLocaleString('th-TH'),
              },
            ],
          }
        : j
    )
  );

  return true;
};

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

  const handleScanQR = () => {
  setSection('public');
  setPublicPage('scanner');
};

  const goRepairDetail = (id: string) => {
    setSelectedJobId(id);
    setAdminPage('repair-detail');
  };

  // ── Public routes ──────────────────────────────────────────────────────────
  if (section === 'public') {
 // เปิดจาก QR URL โดยตรง
  if (urlJobNumber && urlQRToken) {
  return (
    <StatusPage
      jobs={jobs}
      initialJobId={urlQRToken}
      onBack={() => {
        window.history.pushState({}, '', '/');
        setPublicPage('home');
      }}
    />
  );
}
  if (publicPage === 'scanner') {
  return (
    <QRScannerPage
  onBack={() => setPublicPage('home')}
  onScan={(value) => {
  console.log('QR RAW VALUE:', value);

  try {
    const url = new URL(value);

    const match = url.pathname.match(
      /^\/repair\/([^/]+)\/([^/]+)$/
    );

    if (match) {
      const [, jobNumber, qrToken] = match;

      console.log('QR JOB NUMBER:', jobNumber);
      console.log('QR TOKEN:', qrToken);

      setScannedQR(qrToken);
      setPublicPage('status');
      return;
    }
  } catch {
    // ไม่ใช่ URL
  }

  // QR เป็น token โดยตรง
  console.log('QR DIRECT TOKEN:', value);

  setScannedQR(value.trim());
  setPublicPage('status');
}}
  />
  );
}

if (publicPage === 'history') {
  return (
    <RepairHistoryPage
  qrToken={scannedQR ?? ''}
  onBack={() => {
    setScannedQR(null);
    setPublicPage('home');
  }}
/>
  );
}

  if (publicPage === 'status') {
    return (
      <StatusPage
          jobs={jobs}
          onBack={() => {
          setScannedQR(null);
          setPublicPage('home');
      }}
  initialJobId={scannedQR ?? undefined}
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
  <>
    <button
  onClick={testSupabase}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Test Database
</button>

    <HomePage
      onCheckStatus={() => setPublicPage('status')}
      onCheckWarranty={() => setPublicPage('warranty')}
      onAdminLogin={goAdmin}
      onScanQR={handleScanQR}
      onGoAdmin={goAdmin}
    />
  </>
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
    ? (
        <RepairDetailPage
          job={selectedJob}
          onBack={() => setAdminPage('repairs')}
          onUpdateStatus={updateJobStatus}
          onSave={updateRepairJob}
        />
      )
    : (
        <RepairsPage
          jobs={jobs}
          onAddNew={() => setAdminPage('add-repair')}
          onUpdateStatus={updateJobStatus}
          onDeleteJob={deleteJob}
          onViewDetail={goRepairDetail}
        />
      );
      case 'add-repair':
        return (
          <AddRepairPage
              onSave={async job => {
              const ok = await addJob(job);
            if (ok) {
                setAdminPage('repairs');
                }
            }}
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
