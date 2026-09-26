import { readFileSync } from "node:fs";

const carrier = readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8");

const required = [
  "ULTRATHINK",
  "Red Team 1 — premise",
  "Lindy mode",
  "L99",
  "Red Team 2 — implementation",
  "OODA",
  "Proof",
  "Rollback / Next Gate",
];

let cursor = -1;
for (const step of required) {
  const next = carrier.indexOf(step, cursor + 1);
  if (next === -1) {
    throw new Error(`Founder Intelligence carrier missing or out of order: ${step}`);
  }
  cursor = next;
}

for (const marker of ["TRUE-FIRST", "EVIDENCE_ONLY", "STALE != FALSE"]) {
  if (!carrier.includes(marker)) {
    throw new Error(`Founder Intelligence carrier missing marker: ${marker}`);
  }
}

console.log("Founder Intelligence carrier verified.");
