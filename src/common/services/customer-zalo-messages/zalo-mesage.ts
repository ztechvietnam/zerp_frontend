import { EntityBase } from "../entity-base";
import { PatientEntity } from "../patient/patient";
import { ZaloZnsTemplateEntity } from "../zalo-zns-templates/zalo-zns-templates";

export interface ZaloMessageEntity extends EntityBase {
  content: string;
  zalo_oa_id: string;
  customer_id: string;
  customer: PatientEntity;
  message_type: string;
  sent: number;
  sent_time: string;
  zns_template: ZaloZnsTemplateEntity;
}

export enum ZaloMessageType {
  CamOn = "CamOn",
  HenTaiKham = "HenTaiKham",
}