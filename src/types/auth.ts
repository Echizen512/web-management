export interface AuthResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'master' | 'admin' | 'employed';
  };
}

export interface AuthError {
  message: string;
}