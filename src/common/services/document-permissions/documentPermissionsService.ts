import { ServiceBase } from "../servicebase";

export class DocumentPermissionService extends ServiceBase {
  constructor() {
    super({ endpoint: "/document-permissions" });
  }

  async getPerByDocuentId(documentId: string): Promise<any> {
    return this.get<any>({
      endpoint: `/by-document/${documentId}`,
    });
  }

  async getPerByUserId(userId: string): Promise<any> {
    return this.get<any>({
      endpoint: `/by-user/${userId}`,
    });
  }
}

export const documentPermissionService = new DocumentPermissionService();
