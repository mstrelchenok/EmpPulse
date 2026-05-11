

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

// --- App State Types ---
export type ScreenType = 
  | 'login' 
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