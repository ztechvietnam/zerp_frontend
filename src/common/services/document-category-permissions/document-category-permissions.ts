import { EntityBase } from "../entity-base";

export interface DocumentCategoryPermissionEntity extends EntityBase {
  id_permission: number;
  document_category_id: number;
  user_id: number[];
  department_id: number[];
  branch_id: number[];
}
