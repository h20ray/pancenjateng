export interface User {
  id: number;
  name: string;
  email: string;
  username?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  pic?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
