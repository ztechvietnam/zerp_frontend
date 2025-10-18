import { ServiceBase } from "../servicebase";

export class DocumentCategoriesService extends ServiceBase {
  constructor() {
    super({ endpoint: "/document-categories" });
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

export const documentCategoriesService = new DocumentCategoriesService();
