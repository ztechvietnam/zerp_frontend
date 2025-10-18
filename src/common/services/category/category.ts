import { DocumentCategoriesEntity } from "../document-categories/documentCategories";

export interface CategoryEntity {
  id: string;
  name: string;
  code: string;
  parentCode?: string;
  created: string;
  status: boolean;
}

export interface TreeNode {
  title: string;
  value: string;
  item: DocumentCategoriesEntity;
  key: string;
  children?: TreeNode[];
}
