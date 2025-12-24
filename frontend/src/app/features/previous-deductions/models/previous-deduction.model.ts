export interface PreviousDeductions {
  id: number;
  draft: Deductions;
}

interface Deductions {
  annotations?: Deduction[];
  exercises: { [key: string]: PartialDeduction };
}

export interface PartialDeduction {
  [key: string]: Deduction[];
}

export interface Deduction {
  description: string;
  deduction: string;
}
