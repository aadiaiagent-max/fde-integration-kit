/**
 * Fake customer deploy demo — offline, no API keys.
 * Run: npm run example
 */
import {
  validateConfig,
  probeEnv,
  runSmoke,
  assessReadiness,
  type ConfigSchema,
  type CustomerEnv,
} from "../src/index.js";

const schema: ConfigSchema = {
  apiUrl: { type: "string", required: true, description: "Customer API base URL" },
  timeoutMs: { type: "number", required: true },
  featureFlags: { type: "boolean", required: false },
};

const customerConfig: Record<string, unknown> = {
  apiUrl: "https://acme.internal/api/v1",
  timeoutMs: 8000,
  featureFlags: true,
};

const customerEnv: CustomerEnv = {
  NODE_VERSION: process.versions.node,
  CUSTOMER_ID: "acme-corp",
  DEPLOY_REGION: "us-east-1",
};

async function main(): Promise<void> {
  console.log("=== FDE Integration Kit — fake customer deploy ===\n");

  const configChecks = validateConfig(customerConfig, schema);
  const envChecks = probeEnv(customerEnv, {
    requiredVars: ["CUSTOMER_ID", "DEPLOY_REGION"],
    minNodeMajor: 20,
  });
  const smokeChecks = await runSmoke([
    {
      name: "config-url-https",
      fn: () => {
        const url = String(customerConfig.apiUrl);
        if (!url.startsWith("https://")) {
          throw new Error("apiUrl must be https");
        }
      },
    },
    {
      name: "timeout-sane",
      fn: () => {
        const t = customerConfig.timeoutMs;
        if (typeof t !== "number" || t < 100 || t > 60_000) {
          throw new Error("timeoutMs out of range");
        }
      },
    },
  ]);

  const report = assessReadiness([
    ...configChecks,
    ...envChecks,
    ...smokeChecks,
  ]);

  for (const check of report.checks) {
    const mark = check.pass ? "PASS" : "FAIL";
    console.log(`[${mark}] ${check.name}${check.detail ? ` — ${check.detail}` : ""}`);
  }

  console.log(
    `\nDeploy readiness: ${report.pass ? "READY" : "NOT READY"} (${report.checks.length} checks)`,
  );

  if (!report.pass) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
