# Alexa Commerce Engine — Hackathon Launch Audit

Date: 2026-09-23

## Authority
- Repository: `jussray/alexa-commerce-engine-`
- Default branch: `main`
- Main audited SHA: `f23323a684335aa8108abc9bc2ecff5b63eb22d3`
- Existing hardening branch: `fix/audit-truth-metrics`
- Hardening branch audited SHA before this receipt: `b73b3bc718459864e2427ece484a32b98fc2f1ed`

## Goal
Make the Alexa Commerce Engine eligible, demoable, and competitive for the 2026 Amazon Developer Hackathon Alexa+ track without discarding the existing recommendation, shopping-boundary, truth-metrics, or security work.

## VERIFIED
- The repo currently implements an Alexa Skills Kit / Shopping Kit custom-skill flow using `ask-sdk-core`.
- The existing hardening branch adds recommendation-truth handling, security/redaction, metrics, stronger shopping-result continuity, tests, and CI artifact checks.
- The hardening branch CI is green at the pre-receipt audited head.
- The current repository does not contain an Alexa+ MCP server, Agent Skill runtime, or web-based simulated Alexa+ experience.
- The project already contains reusable commerce logic that should be preserved rather than rewritten.

## PRIMARY BLOCKER
The current runtime adapter is a classic Alexa custom skill. The Alexa+ hackathon track requires a working Agent Skill or self-hosted MCP server implementing MCP 2025-11-25+ over Streamable HTTP, or an explicitly simulated Alexa+ experience. Therefore the current repo needs an Alexa+ submission adapter before it should be treated as launch-ready for this hackathon.

## INFERRED
The lowest-risk path is to preserve the existing catalog, recommendation engine, truth metrics, shopping boundaries, and tests, then add a Streamable HTTP MCP server plus a small judge-facing web simulator for the same commerce workflow. This avoids rewriting the proven core while satisfying the Alexa+ runtime/demo requirement.

## UNKNOWN
- Whether Amazon/Devpost reviewer collaborators are currently configured on the private repo.
- Whether a Devpost draft, product-feedback response, friction log, demo video, or judge instructions exist outside this repository.
- Whether any unpushed Claude/Cowork work exists locally.

## RISK
- Merging the hardening branch by itself would improve the classic skill but would not fix the Alexa+ track eligibility gap.
- The existing `Connections.StartConnection` Shopping Kit handoff should not be assumed to be a valid Alexa+ MCP purchasing primitive.
- A repository-green result is not sufficient proof of the Alexa+ judge path.

## ROLLBACK
All launch work should stay on the existing `fix/audit-truth-metrics` branch until MCP/runtime/browser proof is green. The branch can be reset to `b73b3bc718459864e2427ece484a32b98fc2f1ed` if the launch adapter needs to be abandoned.

## NEXT GATE
Add the Alexa+ Streamable HTTP MCP adapter on the existing branch, reuse the existing commerce core, add judge-facing simulator + focused MCP tests + Playwright evidence, then merge only after exact-head CI and real-path proof are green.
