export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'master' | 'admin' | 'empleado';
  };
}

export interface AuthError {
  message: string;
}