import { describe, expect, it } from "vitest";
import { getEmployeeVerificationStatus } from "@/lib/employeeVerification";

describe("employee QR verification status", () => {
  it("shows active records as active", () => {
    expect(getEmployeeVerificationStatus({ is_active: true })).toBe("active");
  });

  it("shows inactive, non-released records as suspended", () => {
    expect(getEmployeeVerificationStatus({ is_active: false })).toBe("suspended");
  });

  it("treats released employees as not found", () => {
    expect(getEmployeeVerificationStatus({ is_active: false, released_at: "2026-01-01T00:00:00Z" })).toBe("not_found");
  });
});