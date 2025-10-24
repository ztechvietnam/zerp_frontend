import { ServiceBase } from "../servicebase";

export class BranchesService extends ServiceBase {
  constructor() {
    super({ endpoint: "/branches" });
  }

  async findAllWithRelations(): Promise<any> {
    return this.get({
      endpoint: `/findAllWithRelations`,
    });
  }
}

export const branchesService = new BranchesService();
