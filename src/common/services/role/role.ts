import { EntityBase } from "../entity-base";

export interface RoleEntity extends EntityBase {
  id: string;
  name: string;
  role_name: string;
}

export enum Role {
  Admin = "Admin",
  User = "User",
}
