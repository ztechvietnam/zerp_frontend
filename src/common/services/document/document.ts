import { CategoryEntity } from "../category/category";

export interface DocumentEntity {
  id: string;
  name: string;
  code: string;
  template: string;
  category: CategoryEntity;
  createdBy: string;
  created: string;
  status: boolean;
}
