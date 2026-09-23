# Alexa Commerce Engine / Shopping Compass

Shopping Compass is a multi-category Alexa+ commerce engine built around a self-hosted Model Context Protocol server. It helps a shopper describe what they need, ranks local catalog options against explicit constraints, shows what matched and what did not, and prepares a truthful Amazon handoff without pretending a cart action, purchase, or commission already happened.

## Alexa+ hackathon path

The primary hackathon runtime is the MCP server at `/mcp`.

- MCP: Streamable HTTP via the official Model Context Protocol TypeScript server packages.
- Compatibility target: MCP `2025-11-25` or later.
- Judge simulator: `/` or `/simulator`.
- Health/proof endpoint: `/health`.
- Existing classic Alexa Shopping Kit skill code remains in `src/index.js` as a secondary adapter, not as the Alexa+ eligibility claim.

## Run locally

```bash
npm install
npm run verify
npm start
```

Then open `http://127.0.0.1:3000/`.

For browser proof:

```bash
npx playwright install chromium
npm run test:e2e
```

## MCP tools

- `list_categories` — lists the supported shopping categories.
- `recommend_product` — ranks products from category, budget, priority, and household context and returns matched/unmatched criteria.
- `prepare_amazon_cart_handoff` — requires explicit confirmation, validates the recommendation, and prepares a handoff boundary without claiming the purchase was executed.

## Current seed categories

- Wireless earbuds
- Air fryers
- Robot vacuums
- Resistance bands
- LED strip lights
- Tumblers / water bottles

The catalog is data-driven, so adding a category extends `src/catalog.js` instead of creating another skill architecture.

## Money truth

`invocation -> qualifier flow -> recommendation -> confirmed handoff -> Amazon cart surface -> qualifying purchase -> commission receipt`

Only the final Associates earnings/reporting receipt proves revenue. Source green, MCP green, a prepared handoff, an Amazon cart result, and even a purchase are not individually treated as proof of commission.

## Verification

CI verifies:

1. syntax and unit tests,
2. MCP `2025-11-25` initialization and tool calls,
3. production dependency audit,
4. Playwright judge journey through the browser simulator,
5. leak-free classic Alexa Lambda packaging and fresh-unzip runtime smoke.

See `docs/HACKATHON_SUBMISSION.md` for the judge flow and submission language, and `docs/audits/2026-09-23-hackathon-launch-audit.md` for the continuity receipt.
