import type { CheckResult, ConfigFieldType, ConfigSchema } from "../types.js";

function isType(value: unknown, expected: ConfigFieldType): boolean {
  switch (expected) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "boolean":
      return typeof value === "boolean";
    default: {
      const _exhaustive: never = expected;
      return _exhaustive;
    }
  }
}

/**
 * Validate a config object against a simple schema.
 * Returns one CheckResult per schema field (required presence + type).
 * Unknown keys in `config` are ignored (schema is the source of truth).
 */
export function validateConfig(
  config: Record<string, unknown>,
  schema: ConfigSchema,
): CheckResult[] {
  const results: CheckResult[] = [];

  for (const [key, def] of Object.entries(schema)) {
    const required = def.required !== false;
    const present = Object.prototype.hasOwnProperty.call(config, key);
    const value = config[key];
    const label = def.description ? `${key} (${def.description})` : key;

    if (!present || value === undefined || value === null) {
      results.push({
        name: `config:${key}`,
        pass: !required,
        detail: required
          ? `Missing required field: ${label}`
          : `Optional field absent: ${label}`,
      });
      continue;
    }

    if (!isType(value, def.type)) {
      results.push({
        name: `config:${key}`,
        pass: false,
        detail: `Expected ${def.type} for ${label}, got ${typeof value}`,
      });
      continue;
    }

    results.push({
      name: `config:${key}`,
      pass: true,
      detail: `OK (${def.type})`,
    });
  }

  return results;
}
