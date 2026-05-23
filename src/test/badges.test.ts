import { describe, it, expect } from "vitest";
import { computeBadgesFor } from "@/lib/badges";

describe("computeBadgesFor", () => {
  it("awards OG for top 10", () => {
    expect(computeBadgesFor(5, 0, false)).toContain("og_10");
  });

  it("awards referrer badges at thresholds", () => {
    expect(computeBadgesFor(200, 3, false)).toContain("referrer_3");
    expect(computeBadgesFor(200, 10, false)).toContain("referrer_10");
  });

  it("includes premium when tier is premium", () => {
    expect(computeBadgesFor(50, 0, true)).toContain("premium");
  });
});
