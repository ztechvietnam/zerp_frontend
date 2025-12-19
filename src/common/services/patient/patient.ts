import { EntityBase } from "../entity-base";

export interface PatientEntity extends EntityBase {
  name: string;
  phone: string;
  email: string;
  address: string;
  customerneed: string;
  afford: string;
  source: string;
  zalo_user_id: string;
  project_id: string;
  customer_id: string;
  medical_id: string;
  personal_id: string;
  department_id: string;
}
