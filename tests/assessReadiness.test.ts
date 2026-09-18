import { describe, expect, it } from "vitest";
import { assessReadiness } from "../src/readiness/assessReadiness.js";
import type { CheckResult } from "../src/types.js";

describe("assessReadiness", () => {
  it("passes only when every check passes (fail-closed)", () => {
    const allPass: CheckResult[] = [
      { name: "a", pass: true },
      { name: "b", pass: true },
    ];
    expect(assessReadiness(allPass).pass).toBe(true);
  });

  it("fails the readiness gate if any check fails", () => {
    const mixed: CheckResult[] = [
      { name: "a", pass: true },
      { name: "b", pass: false, detail: "nope" },
    ];
    const report = assessReadiness(mixed);
    expect(report.pass).toBe(false);
    expect(report.checks).toHaveLength(2);
  });

  it("fails closed on empty check list", () => {
    expect(assessReadiness([]).pass).toBe(false);
  });
});
