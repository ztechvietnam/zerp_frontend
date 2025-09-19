export interface RoleEntity {
  id: string;
  name: string;
  description?: string;
}

export enum Role {
  Admin = "Admin",
  User = "User",
}
