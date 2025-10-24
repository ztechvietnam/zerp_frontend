import { TreeSelectProps } from "antd";
import { EntityBase } from "../entity-base";

export interface DepartmentEntity extends EntityBase {
  branch_id: number;
  department_code: string;
  id_department: number;
  image: string | null;
  is_system: number;
  name: string;
  order: number | null;
  parent_department_id: number | null;
  status: number;
}

export interface BranchEntity extends EntityBase {
  address: string;
  branch_code: string;
  id_branch: number;
  image: string | null;
  is_system: number;
  name: string;
  order: number | null;
  status: number;
}
export interface RoleTreeNode
  extends Omit<NonNullable<TreeSelectProps["treeData"]>[number], "children"> {
  children?: RoleTreeNode[];
}

export interface DepartmentTreeNode {
  title: string;
  value: string;
  item: DepartmentEntity | BranchEntity;
  key: string;
  children?: DepartmentTreeNode[];
}
