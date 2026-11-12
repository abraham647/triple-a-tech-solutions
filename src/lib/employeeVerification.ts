export type EmployeeVerificationStatus = "active" | "suspended";

export interface EmployeeVerificationRecord {
  is_active: boolean;
}

export function getEmployeeVerificationStatus(
  employee: EmployeeVerificationRecord,
): EmployeeVerificationStatus {
  return employee.is_active ? "active" : "suspended";
}
