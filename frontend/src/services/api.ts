import type { MeUser, Department, DepartmentAdmin, Employee } from '../types';

// Carries the HTTP status so callers (e.g. the React Query retry predicate) can
// distinguish client (4xx) from server/network errors without parsing messages.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function clientSafeError(
  res: Response,
  fallback: string,
  overrides: Record<number, string> = {},
): Promise<ApiError> {
  if (overrides[res.status]) return new ApiError(res.status, overrides[res.status]);
  switch (res.status) {
    case 400:
      return new ApiError(res.status, 'The request was invalid. Please check your input and try again.');
    case 401:
      return new ApiError(res.status, 'Your session has expired. Please sign in again.');
    case 403:
      return new ApiError(res.status, 'You do not have permission to perform this action.');
    case 404:
      return new ApiError(res.status, 'The requested item could not be found.');
    case 409:
      return new ApiError(res.status, 'This action conflicts with the current state. Please refresh and retry.');
    default:
      return new ApiError(res.status, fallback);
  }
}

export const authService = {
  login: async (email: string, password: string): Promise<MeUser> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw await clientSafeError(res, 'Unable to sign in. Please try again.', {
        400: 'Invalid email or password.',
        401: 'Invalid email or password.',
      });
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
      throw await clientSafeError(res, 'Failed to create user.', {
        409: 'A user with this email already exists.',
      });
    }
  },

  delete: async (userId: number): Promise<void> => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to delete employee.', {
        403: 'Only the owner can delete employees.',
      });
    }
  },
};

// Raw item shape from GET /api/employees (EmployeeSummaryResponse).
interface EmployeeSummaryDto {
  id: number;
  name: string;
  surname: string;
  departmentId: number | null;
  departmentName: string | null;
}

export const employeeService = {
  // GET /api/employees (OWNER lists all; ADMIN receives only employees in their
  // departments — filtered server-side). Mapped into the app's Employee shape;
  // the API summary carries no leave/status data, so those fields stay absent.
  getAll: async (): Promise<Employee[]> => {
    const res = await fetch('/api/employees', { credentials: 'include' });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to load employees.');
    }
    const data = await res.json();
    const items = (data.items ?? []) as EmployeeSummaryDto[];
    return items.map((e) => ({
      id: String(e.id),
      name: e.name,
      surname: e.surname,
      department: e.departmentName ?? undefined,
    }));
  },
};

export const leaveRequestService = {
  getAll: async () => { throw new Error('Not implemented'); },
  create: async (_data: unknown) => { throw new Error('Not implemented'); },
  update: async (_id: string, _data: unknown) => { throw new Error('Not implemented'); },
  delete: async (_id: string) => { throw new Error('Not implemented'); },
};

export interface DepartmentCreatePayload {
  name: string;
  adminIds?: number[];
}

export const departmentService = {
  // GET /api/departments (OWNER lists all; ADMIN receives only their own — filtered server-side)
  getAll: async (): Promise<Department[]> => {
    const res = await fetch('/api/departments', { credentials: 'include' });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to load departments.');
    }
    const data = await res.json();
    return (data.items ?? []) as Department[];
  },

  // GET /api/departments/{id} (OWNER, or ADMIN for departments they administer)
  // `signal` lets a caller abort an in-flight request (e.g. a superseded selection).
  getById: async (id: number, signal?: AbortSignal): Promise<Department> => {
    const res = await fetch(`/api/departments/${id}`, { credentials: 'include', signal });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to load department.');
    }
    return (await res.json()) as Department;
  },

  // POST /api/departments (OWNER only)
  create: async (payload: DepartmentCreatePayload): Promise<void> => {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to create department.', {
        409: 'A department with this name already exists.',
      });
    }
  },

  // DELETE /api/departments/{id} (OWNER only) — department must have no admins or employees
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to delete department.');
    }
  },

  // PATCH /api/departments/{id} (OWNER only) — rename and/or reassign admins
  update: async (id: number, payload: { name?: string; adminIds?: number[] }): Promise<void> => {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to update department.');
    }
  },
};

export const adminService = {
  // GET /api/admins (OWNER only) — every admin, used to assign admins to departments
  getAll: async (): Promise<DepartmentAdmin[]> => {
    const res = await fetch('/api/admins', { credentials: 'include' });
    if (!res.ok) {
      throw await clientSafeError(res, 'Failed to load admins.');
    }
    const data = await res.json();
    return (data.items ?? []) as DepartmentAdmin[];
  },
};
