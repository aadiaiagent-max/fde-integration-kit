import type { CheckResult, ReadinessReport } from "../types.js";

/**
 * Fail-closed readiness gate: the deploy is ready only if every check passed.
 */
export function assessReadiness(checks: CheckResult[]): ReadinessReport {
  const pass = checks.length > 0 && checks.every((c) => c.pass);
  return { pass, checks };
}
