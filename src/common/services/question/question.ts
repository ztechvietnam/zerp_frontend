export type QuestionType = "CHOOSE" | "TEXT" | "FORM";

export interface QuestionEntity {
  id: string;
  order: number;
  type: QuestionType;
  question: string;
  options?: {
    label: string;
    value: string;
    nextQuestionId?: string | null;
  }[];
  required?: boolean;
  nextQuestionId?: string; // fallback cho TEXT và FORM
  placeholder?: string;
  formFields?: {
    name: string;
    label: string;
    type: "fullName" | "email" | "phone";
    required?: boolean;
    placeholder?: string;
  }[];
}
