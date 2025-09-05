import { ServiceBase } from "../servicebase";

export class PatientService extends ServiceBase {
  constructor() {
    super({ endpoint: "/danhsachbenhnhanoas" });
  }

  async syncData() {
    return this.get({ endpoint: "/" });
  }
}

export const patientService = new PatientService();
