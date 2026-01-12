export interface UserFilter {
  search?: string;
  name?: string;
  email?: string;
  isActive?: boolean;
  roles?: ('ADMIN' | 'EMPLOYEE')[];
  permissionCodes?: string[];
}
