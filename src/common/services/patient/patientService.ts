import { ServiceBase } from "../servicebase";

export class PatientService extends ServiceBase {
  constructor() {
    super({ endpoint: "/syncs" });
  }

  async syncData() {
    return this.post<{ success: boolean; message: string }>(
      {},
      { endpoint: "customers" }
    );
  }
}

export const patientService = new PatientService();
