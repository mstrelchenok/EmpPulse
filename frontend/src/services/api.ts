import type { MeUser } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<MeUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Invalid credentials');
    }
    const data = await res.json();
    return data.user as MeUser;
  },

  logout: async (): Promise<void> => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  },
};

export interface UserCreatePayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  employeeDepartmentId?: number | null;
  yearlyVacationBalance?: number;
  adminDepartmentIds?: number[];
}

export const userService = {
  create: async (payload: UserCreatePayload): Promise<void> => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Failed to create user');
    }
  },
};

export const employeeService = {
  getAll: async () => { throw new Error('Not implemented'); },
  create: async (_data: unknown) => { throw new Error('Not implemented'); },
  delete: async (_id: string) => { throw new Error('Not implemented'); },
};

export const leaveRequestService = {
  getAll: async () => { throw new Error('Not implemented'); },
  create: async (_data: unknown) => { throw new Error('Not implemented'); },
  update: async (_id: string, _data: unknown) => { throw new Error('Not implemented'); },
  delete: async (_id: string) => { throw new Error('Not implemented'); },
};

export const departmentService = {
  getAll: async () => { throw new Error('Not implemented'); },
  create: async (_data: unknown) => { throw new Error('Not implemented'); },
  delete: async (_id: string) => { throw new Error('Not implemented'); },
};
