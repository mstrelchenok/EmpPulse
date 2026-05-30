

// --- Domain Types ---
export interface WorkingShift {
  start: string;
  end: string;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  shifts: WorkingShift[];
}

export interface Department {
  id: string;
  name: string;
  administrators: string[];
  schedule: DaySchedule[];
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  department?: string;
  role?: string;
  status?: 'Personal' | 'Sick' | 'Vacation' | 'Working';
  untilDate?: string;
}

export interface LeaveRequest {
  id: string;
  employeeName: string;
  type: 'Vacation' | 'Personal' | 'Sick';
  dateRange: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
}
// --- Auth / Current User ---
export type UserRole = 'OWNER' | 'ADMIN' | 'WORKER';

export interface MeUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  owner: boolean;
  preferences: { theme: string; language: string };
  employeeProfile: { id: number; departmentId: number | null; departmentName: string | null; vacationBalance: number } | null;
  adminProfile: { id: number; departmentIds: number[] } | null;
}

export function deriveRole(user: MeUser): UserRole {
  if (user.owner) return 'OWNER';
  if (user.adminProfile !== null) return 'ADMIN';
  return 'WORKER';
}

// --- App State Types ---
export type ScreenType =
  | 'login'
  | 'forbidden'
  | 'employees'
  | 'request-manager'
  | 'my-requests'
  | 'departments'
  | 'department-detail'
  | 'my-profile'
  | 'employee-profile';

export type ModalType = 
  | null 
  | 'ADD_EMPLOYEE' | 'ADD_UNASSIGNED' | 'DELETE_EMPLOYEE'
  | 'LOG_HOURS'
  | 'ADD_DEPARTMENT' 
  | 'DELETE_DEPARTMENT'
  | 'EDIT_ADMINS' | 'EDIT_WORKING_HOURS'
  | 'ADD_LEAVE' | 'EDIT_LEAVE'
  | 'CREATE_REQUEST' | 'ACCEPT_REQUEST' // from other screens
  | 'ADD_REQUEST_FORM' | 'EDIT_LEAVE_FORM' // NEW from MyRequests screen
  | 'DELETE_LEAVE' | 'CANCEL_LEAVE' | 'LOGOUT' | 'CHANGE_PASSWORD_CONFIRM' // Confirmations
  | 'CHANGE_PASSWORD_FORM' | 'CHANGE_PASSWORD'; // Existing carried from previous turn