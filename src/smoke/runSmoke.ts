import type { CheckResult, SmokeCase } from "../types.js";

/**
 * Execute smoke-test cases sequentially and collect CheckResult entries.
 * Failures are captured as pass:false — never thrown — so readiness can aggregate them.
 */
export async function runSmoke(cases: SmokeCase[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  for (const testCase of cases) {
    try {
      await testCase.fn();
      results.push({
        name: `smoke:${testCase.name}`,
        pass: true,
        detail: "passed",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        name: `smoke:${testCase.name}`,
        pass: false,
        detail: message,
      });
    }
  }

  return results;
}
