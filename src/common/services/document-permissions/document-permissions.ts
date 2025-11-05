import { EntityBase } from "../entity-base";

export interface DocumentPermissionEntity extends EntityBase {
  id_permission: number;
  document_id: number;
  user_id: number[];
  department_id: number[];
  branch_id: number[];
}
