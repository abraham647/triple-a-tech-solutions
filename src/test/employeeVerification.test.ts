import { describe, expect, it } from "vitest";
import { getEmployeeVerificationStatus } from "@/lib/employeeVerification";

describe("employee QR verification status", () => {
  it("shows active records as active", () => {
    expect(getEmployeeVerificationStatus({ is_active: true })).toBe("active");
  });

  it("shows inactive, non-released records as suspended", () => {
    expect(getEmployeeVerificationStatus({ is_active: false })).toBe("suspended");
  });
});