import { EntityBase } from "../entity-base";

export interface DocumentCategoriesEntity extends EntityBase {
  id_category: number;
  name: string;
  description: string;
  parent_category_id: number;
  image: string;
  status: number;
  order: number;
  is_system: number;
  created_id: number;
  updated_id: number;
}
