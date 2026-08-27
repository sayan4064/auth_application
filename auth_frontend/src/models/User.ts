export interface Role {
  id?: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  enabled: boolean;
  enable?: boolean;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  provider?: string;
  roles?: Role[];
}