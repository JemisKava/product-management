export interface LoginResult {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
  };
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResult {
  user: {
    id: number;
    email: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
  };
  permissions: string[];
  accessToken: string;
}
