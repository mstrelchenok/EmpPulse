import { useQuery } from '@tanstack/react-query';
import { departmentService } from '../services/api';
import { departmentKeys } from '../lib/queryKeys';
import { useAuth } from '../context/AuthContext';

// Departments list. Gated on role: nothing fetches before login (userRole is
// null), and only OWNER/ADMIN may load departments.
export function useDepartmentsList() {
  const { userRole } = useAuth();
  return useQuery({
    queryKey: departmentKeys.lists(),
    queryFn: () => departmentService.getAll(),
    enabled: userRole === 'OWNER' || userRole === 'ADMIN',
  });
}
