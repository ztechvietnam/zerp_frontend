import { UserEntity } from "../user/user";

export interface DepartmentEntity {
  id: string;
  name: string;
  code: string;
  address?: string;
  parentCode?: string;
  createdBy: string;
  created: string;
  status: boolean;
}

export interface DepartmentTreeNode {
  item: DepartmentEntity;
  key: string;
  children?: DepartmentTreeNode[];
  users?: UserEntity[];
}
