import { CrudServiceBase } from "../crud-servicebase";
import { ZaloZnsTemplateEntity } from "./zalo-zns-templates";

class ZaloZnsTemplateService extends CrudServiceBase<ZaloZnsTemplateEntity> {
  constructor() {
    super({
      endpoint: "/zalo-zns-templates",
    });
  }
}

export const zaloZnsTemplateService = new ZaloZnsTemplateService();
