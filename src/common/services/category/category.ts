export interface CategoryEntity {
  id: string;
  name: string;
  code: string;
  parentCode?: string;
  created: string;
  status: boolean;
}

export interface TreeNode {
  item: CategoryEntity;
  key: string;
  children?: TreeNode[];
}