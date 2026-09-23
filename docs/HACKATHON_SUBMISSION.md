# Hackathon Submission Packet — Shopping Compass

## One-line value proposition
Shopping Compass turns natural shopping intent into transparent, constraint-aware product recommendations and an explicitly confirmed Amazon handoff through an Alexa+ compatible MCP server.

## Problem
Voice shopping often compresses a complicated decision into a shallow search result. A shopper may care about budget, durability, household context, or a specific priority, but typical flows do not show which constraints actually influenced the recommendation. Commerce demos can also overstate success by treating a handoff, cart action, or purchase as revenue proof.

## Solution
Shopping Compass exposes a self-hosted MCP commerce engine over Streamable HTTP. The engine:

1. accepts a shopping category plus budget, priority, and household context,
2. ranks a data-driven local catalog,
3. returns the winning recommendation and the criteria that did or did not match,
4. requires explicit confirmation before preparing a shopping handoff,
5. preserves the boundary between recommendation, Amazon-controlled cart activity, purchase, and commission evidence.

## Why Alexa+
Shopping is naturally conversational, but useful voice commerce requires more than one-turn lookup. The MCP tool surface lets an Alexa+ style agent discover capabilities, reason across shopper constraints, preserve authority boundaries, and call the same deterministic commerce logic used by the simulator.

## Required technology
- Self-hosted MCP server
- Streamable HTTP
- Minimum supported Alexa+ submission protocol: MCP `2025-11-25`
- Official Model Context Protocol TypeScript server and Node adapter packages
- Playwright browser verification
- Node.js 24

## Judge journey
1. Run `npm install`.
2. Run `npm run verify`.
3. Start with `npm start`.
4. Open `http://127.0.0.1:3000/`.
5. Pick a category, budget, priority, and household context.
6. Select **Find my best match**.
7. Inspect the recommendation and matched/unmatched criteria returned by the `recommend_product` MCP tool.
8. Select **Confirm & prepare Amazon handoff**.
9. Inspect the proof payload: the handoff is prepared, shopper confirmation is recorded, but the MCP server explicitly says it did not execute a purchase and does not claim commission.

## Architecture

```text
Judge / shopper
      |
      v
Web simulator
      |
      v
/mcp  Streamable HTTP
      |
      v
Shopping Compass MCP tools
      |
      +--> catalog.js
      +--> recommendation-engine.js
      +--> shopping-actions.js
      +--> security / metrics truth boundaries
      |
      v
Recommendation + authority/proof receipt
```

The existing classic Alexa Shopping Kit handler remains a secondary adapter and is not used as the Alexa+ eligibility claim.

## Demo script (under 3 minutes)
**0:00–0:20** — State the problem: voice commerce should explain the decision and should not fake purchase/revenue proof.

**0:20–0:45** — Show the repository and `/health` endpoint identifying the MCP path and minimum protocol.

**0:45–1:30** — Use Shopping Compass to ask for a product with category, budget, priority, and household context. Show the recommendation plus matched/unmatched criteria.

**1:30–2:10** — Confirm the handoff. Show the MCP proof payload and point out that Amazon still owns the final cart/purchase boundary.

**2:10–2:40** — Show the three MCP tools and explain that new categories are data extensions, not new skills.

**2:40–3:00** — Show CI / Playwright proof and close on the principle: natural shopping intent becomes bounded, inspectable action.

## Technical challenges
- Preserving the existing commerce core while replacing the hackathon-facing adapter with a real MCP runtime.
- Supporting the Alexa+ minimum protocol without inventing access to gated preview tooling.
- Keeping purchasing claims truthful across recommendation, handoff, cart, purchase, and commission boundaries.
- Making the browser demo exercise the actual MCP tool path instead of a parallel fake API.

## Future work
- Replace the seed catalog with provider-backed live product data while preserving deterministic evidence fields.
- Add durable user preference state with local-first synchronization.
- Add a provider-authorized purchasing adapter when the relevant Alexa+/Amazon production capability is available.
- Add richer media/card responses and cross-session shopping continuity.

## Truth boundary
This submission does not claim that the MCP server itself completes an Amazon purchase or earns a commission. Those outcomes require separate provider/runtime evidence.
