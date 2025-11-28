import { ServiceBase } from "../servicebase";

export class DocumentService extends ServiceBase {
  constructor() {
    super({ endpoint: "/documents" });
  }

  async deleteDocument(document_id: string): Promise<boolean> {
    return this.delete(
      {},
      {
        endpoint: `/${document_id}`,
      }
    );
  }

  async findAndFilter(
    categoryIds: number[],
    keyword?: string,
    years?: string[],
    startDate?: string | null,
    endDate?: string | null
  ): Promise<any> {
    return this.post(
      {
        keyword: keyword || "",
        categoryIds,
        years,
        timeRange: [startDate, endDate],
      },
      {
        endpoint: "/findandfilter",
      }
    );
  }
}

export const documentService = new DocumentService();
