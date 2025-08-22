import { EntityBase } from "../entity-base";
import { RoleEntity } from "../role/role";

export interface UserEntity extends EntityBase {
  email: string;
  provider: string;
  socialId?: string;
  firstName: string;
  lastName: string;
  role: RoleEntity;
  passWord?: string;
  status: StatusEntity;
}

export interface StatusEntity {
  id: string;
  name: string;
}