import { EntityBase } from "../entity-base";

export interface DocumentEntity extends EntityBase {
  id_document: number;
  title: string;
  description: string;
  content: string;
  status: number;
  order: number;
  image: string;
  document_attachment: { title: string; linkFile: string }[];
  category_id: number;
  is_featured: number;
  code: string;
  file: string;
  id_branch: number;
  id_department: number;
  excel: string;
  created_id: number;
  updated_id: number;
  deleted_id: number;
}

