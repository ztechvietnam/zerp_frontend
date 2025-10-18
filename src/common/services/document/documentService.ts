import { ServiceBase } from "../servicebase";

export class DocumentService extends ServiceBase {
  constructor() {
    super({ endpoint: "/documents" });
  }

  async deleteCategory(category_id: string): Promise<boolean> {
    return this.delete(
      {},
      {
        endpoint: `/${category_id}`,
      }
    );
  }
}

export const documentService = new DocumentService();
