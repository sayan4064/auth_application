import type { User } from "./User";

export interface LoginResponseData {
  accessToken: string;
  user: User;
  expiresIn?: number;
}