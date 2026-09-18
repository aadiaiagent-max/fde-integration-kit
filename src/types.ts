/**
 * Shared types for the FDE integration kit.
 * Designed for offline customer-environment validation with zero runtime deps.
 */

/** Outcome of a single validation / probe / smoke check. */
export interface CheckResult {
  name: string;
  pass: boolean;
  detail?: string;
}

/** Aggregate deploy-readiness report. Passes only when every check passes (fail-closed). */
export interface ReadinessReport {
  pass: boolean;
  checks: CheckResult[];
}

/**
 * Injectable customer environment snapshot.
 * Prefer injecting over reading process.env so checks stay offline and testable.
 */
export interface CustomerEnv {
  /** Semantic Node version string, e.g. "20.11.0" or "v20.11.0". */
  NODE_VERSION?: string;
  /** Arbitrary string env vars present in the customer install. */
  [key: string]: string | undefined;
}

/** Supported primitive field types for the simple config schema. */
export type ConfigFieldType = "string" | "number" | "boolean";

/** One field definition in a config schema. */
export interface ConfigFieldDef {
  type: ConfigFieldType;
  required?: boolean;
  /** Optional human-readable description for failure detail. */
  description?: string;
}

/** Map of config key → field definition. */
export type ConfigSchema = Record<string, ConfigFieldDef>;

/** A single smoke-test case. */
export interface SmokeCase {
  name: string;
  fn: () => void | Promise<void>;
}
