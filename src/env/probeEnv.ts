import type { CheckResult, CustomerEnv } from "../types.js";

const DEFAULT_MIN_MAJOR = 20;

function parseMajor(version: string | undefined): number | null {
  if (!version) return null;
  const cleaned = version.replace(/^v/i, "").trim();
  const major = Number.parseInt(cleaned.split(".")[0] ?? "", 10);
  return Number.isFinite(major) ? major : null;
}

export interface ProbeEnvOptions {
  /** Env keys that must be present and non-empty. */
  requiredVars?: string[];
  /** Minimum Node major version (default 20). */
  minNodeMajor?: number;
}

/**
 * Probe a customer environment snapshot.
 * Injectable `env` keeps the kit offline and unit-testable (no process.env coupling).
 */
export function probeEnv(
  env: CustomerEnv,
  options: ProbeEnvOptions = {},
): CheckResult[] {
  const requiredVars = options.requiredVars ?? [];
  const minNodeMajor = options.minNodeMajor ?? DEFAULT_MIN_MAJOR;
  const results: CheckResult[] = [];

  const major = parseMajor(env.NODE_VERSION);
  if (major === null) {
    results.push({
      name: "env:NODE_VERSION",
      pass: false,
      detail: "NODE_VERSION missing or unparseable",
    });
  } else if (major < minNodeMajor) {
    results.push({
      name: "env:NODE_VERSION",
      pass: false,
      detail: `Node ${major} < required major ${minNodeMajor}`,
    });
  } else {
    results.push({
      name: "env:NODE_VERSION",
      pass: true,
      detail: `Node major ${major} >= ${minNodeMajor}`,
    });
  }

  for (const key of requiredVars) {
    const value = env[key];
    const ok = typeof value === "string" && value.trim().length > 0;
    results.push({
      name: `env:${key}`,
      pass: ok,
      detail: ok ? "present" : `Missing or empty required env var: ${key}`,
    });
  }

  return results;
}
