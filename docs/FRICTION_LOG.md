# Shopping Compass — Hackathon Friction Log

Date: 2026-09-23

## 1. Alexa custom-skill path did not satisfy the Alexa+ runtime requirement

- **Task attempted:** Turn the existing Alexa commerce project into an eligible Alexa+ hackathon submission.
- **Steps taken:** Audited the repository, compared the current runtime against the hackathon submission requirements, and inspected the existing `ask-sdk-core` Shopping Kit implementation.
- **Expected:** The existing Alexa integration would be sufficient as the hackathon-facing runtime.
- **Actual:** The project was a classic Alexa custom skill. The Alexa+ track requires a working Agent Skill or self-hosted MCP server using MCP 2025-11-25+ over Streamable HTTP, or a clearly simulated Alexa+ experience.
- **Severity:** Critical.
- **Workaround:** Preserved the existing commerce core and added a real Streamable HTTP MCP server plus a judge-facing web simulator that exercises the same MCP tool path.
- **Actionable suggestion:** Put the Alexa+ runtime eligibility requirement in the primary quick-start checklist and starter materials, with a minimal passing MCP example and a clear comparison table for Custom Skill vs Agent Skill vs MCP vs simulation.

## 2. Runtime proof required more than repository-green unit tests

- **Task attempted:** Prove the judge-facing experience end to end.
- **Steps taken:** Added MCP protocol tests, launched the real server, exercised the browser simulator with Playwright, uploaded browser proof, and retained classic Alexa Lambda smoke checks.
- **Expected:** A conventional CI test suite would be enough to establish readiness.
- **Actual:** Passing source/unit tests did not prove the browser-to-MCP judge journey or the packaging/runtime boundary.
- **Severity:** Important.
- **Workaround:** Expanded CI to verify protocol behavior, browser flow, artifacts, secret-shaped leakage, and fresh-unzip runtime loading.
- **Actionable suggestion:** Provide an official Alexa+ submission verification checklist that separates code-green, MCP transport-green, simulator-green, and deploy/judge-path-green evidence.

## 3. Purchasing and revenue proof boundaries are easy to overstate

- **Task attempted:** Demonstrate a commerce workflow without claiming a purchase or commission that the project did not control.
- **Steps taken:** Separated recommendation, explicit confirmation, Amazon handoff preparation, cart result, purchase, and commission evidence in code and documentation.
- **Expected:** The integration boundary for commerce outcomes would be obvious from the developer flow.
- **Actual:** A successful handoff can look like a successful purchase unless the project explicitly records authority and evidence boundaries.
- **Severity:** Important.
- **Workaround:** The MCP tool returns a proof payload stating that it prepares the handoff but does not execute a purchase or claim commission.
- **Actionable suggestion:** Add official examples for truthful commerce event semantics, especially what developers may claim at recommendation, cart, purchase, and attribution stages.
