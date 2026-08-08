export type RepairStatus =
  | 'รับเครื่อง'
  | 'ตรวจสอบ'
  | 'เสนอราคา'
  | 'รออนุมัติ'
  | 'กำลังซ่อม'
  | 'ทดสอบ'
  | 'ซ่อมเสร็จ'
  | 'รับเครื่องแล้ว';

export type DeviceType =
  | 'โทรศัพท์มือถือ'
  | 'คอมพิวเตอร์'
  | 'โน้ตบุ๊ก'
  | 'แท็บเล็ต'
  | 'โทรทัศน์'
  | 'อื่นๆ';

export type UserRole = 'admin' | 'staff' | 'technician';

export interface RepairJob {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  phone: string;
  device: DeviceType;
  brand: string;
  model: string;
  serialNumber: string;
  problem: string;
  diagnosis: string;
  repairDetail: string;
  status: RepairStatus;
  statusHistory: { status: RepairStatus; note: string; by: string; at: string }[];
  createdAt: string;
  updatedAt: string;
  estimatedCost: number;
  actualCost: number;
  technician: string;
  warrantyDays: number;
  warrantyExpiry: string;
  hasWarranty: boolean;
  qrToken: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  lineId: string;
  address: string;
  notes: string;
  createdAt: string;
}

export type AdminPage =
  | 'dashboard'
  | 'repairs'
  | 'add-repair'
  | 'repair-detail'
  | 'customers'
  | 'customer-profile'
  | 'qrcode'
  | 'warranty'
  | 'reports'
  | 'settings';

export type PublicPage = 'home' | 'repair-status' | 'warranty';
export type AppSection = 'public' | 'login' | 'admin';

export interface AdminUser {
  name: string;
  role: UserRole;
  email: string;
}
