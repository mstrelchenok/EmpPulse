import type { Employee, LeaveRequest } from '../types';

export const DEPARTMENT_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Andrei Didenko', email: 'andrei.didenko@email.com', department: 'Department 1', role: 'Administrator', status: 'Working' },
  { id: '2', name: 'Oleksandr Lypiatskyi', status: 'Personal', untilDate: '30.05.2026' },
  { id: '3', name: 'Nazar Bezmenov', status: 'Sick', untilDate: '21.05.2026' },
  { id: '4', name: 'Maryia Stralchonak', status: 'Vacation', untilDate: '18.05.2026' },
];

export const UNASSIGNED_EMPLOYEES: Employee[] = [
  { id: '5', name: 'Milana Ronchyk' },
];

export const PENDING_REQUESTS: LeaveRequest[] = [
  { id: '1', employeeName: 'Nazar Bezmenov', type: 'Sick', dateRange: '20.05.2026 - 21.05.2026', status: 'PENDING' },
  { id: '2', employeeName: 'Maryia Stralchonak', type: 'Vacation', dateRange: '10.05.2026 - 18.05.2026', status: 'PENDING' },
];

export const MY_REQUESTS: LeaveRequest[] = [
  { id: '1', employeeName: 'Me', type: 'Vacation', dateRange: '20.06.2026 - 30.06.2026', status: 'PENDING' },
  { id: '2', employeeName: 'Me', type: 'Personal', dateRange: '28.05.2026 - 30.05.2026', status: 'REJECTED' },
  { id: '3', employeeName: 'Me', type: 'Sick', dateRange: '17.03.2026 - 21.03.2026', status: 'APPROVED' },
  { id: '4', employeeName: 'Me', type: 'Vacation', dateRange: '20.12.2025 - 26.12.2025', status: 'CANCELLED' },
];

export const DEPARTMENTS: string[] = [
  'Department 1', 'Department 2', 'Department 3', 'Department 4', 'Department 5', 'Department 6',
];

export const MOCK_LOGGED_HOURS = [
  { date: '28.05.2026', start: '9:00', end: '17:00', duration: '8 hours' },
  { date: '28.05.2026', start: '9:00', end: '17:00', duration: '8 hours' },
];
