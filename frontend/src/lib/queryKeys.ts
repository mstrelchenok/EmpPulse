export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
};

export const adminKeys = {
  all: ['admins'] as const,
  lists: () => [...adminKeys.all, 'list'] as const,
};
