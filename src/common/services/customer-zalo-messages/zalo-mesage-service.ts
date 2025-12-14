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

  async sendMessageByMessageId(message_id: string) {
    return this.post<any>(
      {},
      {
        endpoint: `send-one-zns/${message_id}`,
      }
    );
  }
}

export const zaloMessageService = new ZaloMessageService();
