import { CrudServiceBase } from "../crud-servicebase";
import { ZaloMessageEntity } from "./zalo-mesage";

class ZaloMessageService extends CrudServiceBase<ZaloMessageEntity> {
  constructor() {
    super({
      endpoint: "/customer-zalo-messages",
    });
  }

  async getMessageByCustomerId(
    customer_id: string
  ): Promise<ZaloMessageEntity[]> {
    return this.get<ZaloMessageEntity[]>({
      endpoint: `by-customer/${customer_id}`,
    });
  }
}

export const zaloMessageService = new ZaloMessageService();
