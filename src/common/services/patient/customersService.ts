import { CrudServiceBase } from "../crud-servicebase";
import { PatientEntity } from "./patient";

export class CustomersService extends CrudServiceBase<PatientEntity> {
  constructor() {
    super({
      endpoint: "/customers",
      populateKeys: [
        "project_id",
        "created_id",
        "department_id",
        "customer_id",
      ],
    });
  }

  async getLinkZaloAuthorization(customer_id: string): Promise<string> {
    return this.get<string>({
      endpoint: `zalo/authorization/${customer_id}`,
    });
  }
}

export const customersService = new CustomersService();
