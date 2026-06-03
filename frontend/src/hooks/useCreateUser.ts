import { useMutation } from '@tanstack/react-query';
import { userService, type UserCreatePayload } from '../services/api';

// User creation. No cache to invalidate yet — employee lists are still mock/unwired.
export function useCreateUser() {
  return useMutation({
    mutationFn: (payload: UserCreatePayload) => userService.create(payload),
  });
}
