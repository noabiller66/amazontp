export interface User {
  id: number;
  username: string;
  email: string;
  token?: string; // stocke le token après login
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}