import { EntityBase } from "../entity-base";
import { PatientEntity } from "./patient";

export interface PatientDashboardEntity extends EntityBase {
    customer_id: number | null;
    customer: PatientEntity | null;
    reception_time: Date | null;
    reception_id: number | null;
    department_name: string | null;
    exam_time: Date | null;
    exam_end_time: Date | null;
    exam_status: string | null;
    service_name: string | null;
    service_group_name: string | null;
    order_time: Date | null;
    result_time: Date | null;
    paraclinical_status: string | null;
    medication_dispense_time: Date | null;
    total_process_time: number | null;
    report_date: Date | null;
    customer_paraclinical: CustomerParaclinicalEntity[];
}

export interface CustomerParaclinicalEntity extends EntityBase {
    reception_id: number;
    service_name: string;
    service_group_name: string;
    order_time: Date;
    result_time: Date;
    paraclinical_status: string;
}