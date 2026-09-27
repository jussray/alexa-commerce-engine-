# Devpost Final Submission Answers — Shopping Compass

Date: 2026-09-23
Repo: `jussray/alexa-commerce-engine-`
Primary track: Alexa+

## Locked project fields
- Project: Shopping Compass
- Tagline: Constraint-aware Alexa+ shopping recommendations with explicit proof and purchasing boundaries.
- Repository: https://github.com/jussray/alexa-commerce-engine-
- Primary track: Alexa+
- Existing project: Existing, but significantly updated.
- AWS Builder Mini Challenge: No
- Open Source Mini Challenge: No

## Existing-project update explanation
During the submission period, Shopping Compass was significantly upgraded from a classic Alexa Shopping Kit flow into an Alexa+ hackathon-ready system. The update added a self-hosted MCP server over Streamable HTTP, MCP 2025-11-25+ compatibility, a judge-facing web simulator that exercises the real MCP tool path, protocol-level MCP tests, Playwright end-to-end verification, recommendation-truth handling, security/redaction checks, proof receipts, CI packaging and artifact evidence, and submission documentation. The existing commerce recommendation core was preserved and adapted rather than replaced.

## AWS Builder Mini Challenge requirement
N/A — Shopping Compass is not being entered into the AWS Builder Mini Challenge. The repository currently packages the classic Alexa adapter for Lambda compatibility but does not claim an AWS Builder runtime-service integration.

## Open Source Mini Challenge
No. The hackathon repository is private and is not being claimed as an Open Source Mini Challenge submission.

## Optional feature request
**Important:** Provide a first-party Alexa+ developer sandbox that can connect directly to a self-hosted Streamable HTTP MCP server and expose request/response traces, protocol negotiation, tool discovery, authorization state, and device-style rendering before production preview access. This would reduce the gap between an MCP server that is protocol-correct locally and one proven inside the Alexa+ runtime.

## Optional friction log
Use the repository friction log:
`docs/FRICTION_LOG.md`

## Feedback Q1 — Which developer tools, APIs, and SDKs did you use and for what?
Shopping Compass uses the Model Context Protocol TypeScript server and Node adapter packages to expose the Alexa+ commerce tool surface over Streamable HTTP. The MCP server provides category discovery, constraint-aware product recommendation, and an explicitly confirmed Amazon shopping-handoff preparation tool. The project also preserves an `ask-sdk-core` based classic Alexa Shopping Kit adapter as a secondary compatibility path. Node.js 24 runs the service and test suite, and Playwright verifies the judge-facing browser journey end to end against the real MCP path.

## Feedback Q2 — What worked well?
MCP's tool model made it straightforward to keep capability discovery, recommendation logic, and authority boundaries separate. The same deterministic recommendation core can be called from the browser simulator without creating a fake parallel API. Streamable HTTP works well for a self-hosted judgeable service, and protocol-level tests make the required MCP behavior reproducible. The classic Alexa SDK remains useful as a compatibility adapter. Playwright provided a reliable way to prove that the visible judge experience actually reaches the MCP-backed workflow.

## Feedback Q3 — What needs work?
The biggest friction is the gap between building a protocol-correct self-hosted MCP server and validating the exact experience inside Alexa+ when production or preview access is limited. A first-party local Alexa+ MCP test harness with protocol traces and device-style rendering would make onboarding much clearer. Documentation could also make the relationship between Alexa+ MCP purchasing flows and classic Alexa Shopping Kit purchasing boundaries more explicit, especially around which system owns cart, purchase, and post-purchase truth.

## Feedback Q4 — How was onboarding?
The fastest path was starting from the open MCP specification and building a local Streamable HTTP server with deterministic tools and protocol tests. The harder part was translating an existing classic Alexa commerce skill into an Alexa+ compliant architecture without pretending that classic Shopping Kit behavior was equivalent to Alexa+ MCP purchasing. Building a simulator that calls the real MCP path, then locking it with Playwright, made the zero-to-working-demo path much more reliable.

## Feedback Q5 — Would you build with these devices and services again?
Yes. MCP is a strong fit for modular commerce because it separates the conversational client from deterministic commerce capabilities and allows the same core to support additional categories without creating one-off skills. I would use the Alexa developer ecosystem again, especially with a stronger local Alexa+ testing path that makes protocol, authorization, and purchasing boundaries easier to inspect before production access.

## Demo video
Current-head browser proof is verified at `main@68b27042c0e50dc8b5dcc6b7d236aabd380a0a95` by GitHub Actions run `36208071058`: the Playwright judge-flow step passed and produced artifact `alexa-commerce-browser-proof-68b27042c0e50dc8b5dcc6b7d236aabd380a0a95` (SHA-256 `d105f54d2c10c8cfb026ddcc9f1f39f259960e5c847b82532552c09d82399baf`). The retained Playwright recording is approximately 1.68 seconds and is browser-proof evidence, not the required public submission demo. A separate public YouTube or Vimeo demo URL still needs to be produced and attached before the Devpost video requirement is satisfied.

## Reviewer access gate
Because the repository is private, the required Amazon reviewers and Devpost testing access must be granted before final submission. Current live permission checks showed no access for the six required Amazon GitHub reviewer accounts at audit time.

## Final-submit-only fields
The following are intentionally not pre-attested in code or documentation and must be truthfully completed by the submitting entrant/representative in Devpost:
- Submitter type / organization identity where applicable
- Country / jurisdiction fields
- Age-of-majority attestation
- Eligible-jurisdiction attestation
- Employee/conflict attestation
- Final public YouTube/Vimeo URL
