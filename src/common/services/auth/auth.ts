import { UserEntity } from "../user/user";

export interface AuthEntity {
  refreshToken: string;
  token: string;
  tokenExpires: number;
  user: UserEntity;
}
