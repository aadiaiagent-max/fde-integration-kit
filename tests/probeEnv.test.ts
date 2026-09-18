import { describe, expect, it } from "vitest";
import { probeEnv } from "../src/env/probeEnv.js";

describe("probeEnv", () => {
  it("passes with Node 20+ and required vars present", () => {
    const results = probeEnv(
      {
        NODE_VERSION: "v20.11.0",
        CUSTOMER_ID: "acme-1",
        REGION: "us-east-1",
      },
      { requiredVars: ["CUSTOMER_ID", "REGION"] },
    );
    expect(results.every((r) => r.pass)).toBe(true);
  });

  it("fails when a required env var is missing", () => {
    const results = probeEnv(
      { NODE_VERSION: "20.0.0", CUSTOMER_ID: "acme-1" },
      { requiredVars: ["CUSTOMER_ID", "REGION"] },
    );
    const region = results.find((r) => r.name === "env:REGION");
    expect(region?.pass).toBe(false);
    expect(region?.detail).toMatch(/Missing or empty/);
  });

  it("fails when NODE_VERSION is below minimum", () => {
    const results = probeEnv(
      { NODE_VERSION: "18.19.0" },
      { minNodeMajor: 20 },
    );
    const node = results.find((r) => r.name === "env:NODE_VERSION");
    expect(node?.pass).toBe(false);
  });

  it("fails when NODE_VERSION is absent", () => {
    const results = probeEnv({});
    const node = results.find((r) => r.name === "env:NODE_VERSION");
    expect(node?.pass).toBe(false);
  });
});
