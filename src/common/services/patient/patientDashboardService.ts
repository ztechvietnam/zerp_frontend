import { ServiceBase } from "../servicebase";

export class PatientDashboardService extends ServiceBase {
    constructor() {
        super({ endpoint: "/customer-dashboards" });
    }
}

export const patientDashboardService = new PatientDashboardService();
