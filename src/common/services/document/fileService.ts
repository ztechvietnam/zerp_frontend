import { ServiceBase } from "../servicebase";

export class FileService extends ServiceBase {
  constructor() {
    super({ endpoint: "/files" });
  }

  async uploadFile(formData: FormData) {
    return this.post<any>(formData, { endpoint: "upload" });
  }
}

export const fileService = new FileService();
