export interface PreviousDeductions {
  annotations?: Deduction[];
  exercises: { [key: string]: PartialDeduction };
}

interface PartialDeduction {
  [key: string]: Deduction[];
}

export interface Deduction {
  description: string;
  deduction: string;
}
