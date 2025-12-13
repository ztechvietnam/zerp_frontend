import { EntityBase } from "../entity-base";

export interface ZaloZnsTemplateEntity extends EntityBase {
  zns_template_id: string;
  zns_template_code: string;
  zns_template_name: string;
}