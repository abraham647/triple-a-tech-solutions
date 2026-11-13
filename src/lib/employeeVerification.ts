export type EmployeeVerificationStatus = "active" | "suspended" | "not_found";

export interface EmployeeVerificationRecord {
  is_active: boolean;
  released_at?: string | null;
}

export function getEmployeeVerificationStatus(
  employee: EmployeeVerificationRecord,
): EmployeeVerificationStatus {
  if (employee.released_at) return "not_found";
  return employee.is_active ? "active" : "suspended";
}
