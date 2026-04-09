// 工业信息化系统核心类型定义

// 用户权限
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
}

// MES - 生产管理
export interface ProductionOrder {
  id: string;
  orderNo: string;
  productCode: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  assignedTo?: string;
}

export interface WorkStation {
  id: string;
  name: string;
  code: string;
  status: 'idle' | 'running' | 'maintenance' | 'error';
  currentOrder?: string;
}

// WMS - 仓储管理  
export interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  location?: string;
  lastUpdated: Date;
}

export interface StockMovement {
  id: string;
  type: 'in' | 'out' | 'transfer';
  itemId: string;
  quantity: number;
  fromWarehouse?: string;
  toWarehouse?: string;
  timestamp: Date;
  operator: string;
}

// QMS - 质量管理
export interface QualityCheck {
  id: string;
  orderNo: string;
  checkType: 'incoming' | 'process' | 'final';
  status: 'passed' | 'failed' | 'pending';
  inspector: string;
  checkTime: Date;
  defects?: string[];
}

// EMS - 设备管理
export interface Equipment {
  id: string;
  name: string;
  code: string;
  type: string;
  status: 'running' | 'idle' | 'maintenance' | 'error';
  location: string;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

// 通用响应
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}