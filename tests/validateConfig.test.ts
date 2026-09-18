import { describe, expect, it } from "vitest";
import { validateConfig } from "../src/config/validateConfig.js";
import type { ConfigSchema } from "../src/types.js";

const schema: ConfigSchema = {
  apiUrl: { type: "string", required: true, description: "Base API URL" },
  timeoutMs: { type: "number", required: true },
  dryRun: { type: "boolean", required: false },
};

describe("validateConfig", () => {
  it("passes when required keys and types match", () => {
    const results = validateConfig(
      { apiUrl: "https://customer.example/api", timeoutMs: 5000, dryRun: true },
      schema,
    );
    expect(results.every((r) => r.pass)).toBe(true);
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.name)).toEqual([
      "config:apiUrl",
      "config:timeoutMs",
      "config:dryRun",
    ]);
  });

  it("fails on missing required key", () => {
    const results = validateConfig({ timeoutMs: 1000 }, schema);
    const api = results.find((r) => r.name === "config:apiUrl");
    expect(api?.pass).toBe(false);
    expect(api?.detail).toMatch(/Missing required/);
  });

  it("fails on wrong type", () => {
    const results = validateConfig(
      { apiUrl: "https://x", timeoutMs: "slow" },
      schema,
    );
    const timeout = results.find((r) => r.name === "config:timeoutMs");
    expect(timeout?.pass).toBe(false);
    expect(timeout?.detail).toMatch(/Expected number/);
  });

  it("allows absent optional fields", () => {
    const results = validateConfig(
      { apiUrl: "https://x", timeoutMs: 1 },
      schema,
    );
    const dryRun = results.find((r) => r.name === "config:dryRun");
    expect(dryRun?.pass).toBe(true);
  });
});
