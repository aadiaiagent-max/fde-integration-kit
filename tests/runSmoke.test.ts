import { describe, expect, it } from "vitest";
import { runSmoke } from "../src/smoke/runSmoke.js";

describe("runSmoke", () => {
  it("collects passes for successful cases", async () => {
    const results = await runSmoke([
      { name: "ping", fn: () => undefined },
      { name: "async-ok", fn: async () => undefined },
    ]);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.pass)).toBe(true);
    expect(results[0]?.name).toBe("smoke:ping");
  });

  it("captures smoke failure without throwing", async () => {
    const results = await runSmoke([
      { name: "ok", fn: () => undefined },
      {
        name: "db-reachable",
        fn: () => {
          throw new Error("connection refused");
        },
      },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0]?.pass).toBe(true);
    expect(results[1]?.pass).toBe(false);
    expect(results[1]?.detail).toBe("connection refused");
  });
});
