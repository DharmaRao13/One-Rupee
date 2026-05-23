import { describe, it, expect } from "vitest";
import { generateReferralCode } from "@/lib/referral";

describe("generateReferralCode", () => {
  it("builds a code from display name", () => {
    const code = generateReferralCode("BraveOwl");
    expect(code).toMatch(/^BRAVEO-/);
    expect(code.length).toBeGreaterThan(6);
  });

  it("falls back when name has no alphanumerics", () => {
    const code = generateReferralCode("!!!");
    expect(code.startsWith("USER-")).toBe(true);
  });
});
