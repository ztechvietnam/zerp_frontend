import { ServiceBase } from "../servicebase";

export class DocumentCategoryPermissionService extends ServiceBase {
  constructor() {
    super({ endpoint: "/document-category-permissions" });
  }

  async getPerByDocumentCategoryId(documentCategoryId: string): Promise<any> {
    return this.get<any>({
      endpoint: `/by-document-category/${documentCategoryId}`,
    });
  }

  async getPerByUserId(userId: string): Promise<any> {
    return this.get<any>({
      endpoint: `/by-user/${userId}`,
    });
  }
}

export const documentCategoryPermissionService =
  new DocumentCategoryPermissionService();
