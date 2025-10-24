import { ServiceBase } from "../servicebase";

export class DepartmentService extends ServiceBase {
  constructor() {
    super({ endpoint: "/departments" });
  }

  async deleteDepartment(department_id: string): Promise<boolean> {
    return this.delete(
      {},
      {
        endpoint: `/${department_id}`,
      }
    );
  }
}

export const departmentService = new DepartmentService();
