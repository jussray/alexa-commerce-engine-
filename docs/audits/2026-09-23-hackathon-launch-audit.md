# Alexa Commerce Engine — Hackathon Launch Audit

Date: 2026-09-23

## Authority
- Repository: `jussray/alexa-commerce-engine-`
- Default branch: `main`
- Working branch: `fix/audit-truth-metrics`
- Main baseline audited SHA: `f23323a684335aa8108abc9bc2ecff5b63eb22d3`
- Pre-launch hardening SHA: `b73b3bc718459864e2427ece484a32b98fc2f1ed`
- Alexa+ launch implementation SHA: `b77d751123dccc5aff639dfa6c2c0be0296c63a3`

## Goal
Make the Alexa Commerce Engine eligible, demoable, and competitive for the 2026 Amazon Developer Hackathon Alexa+ track without discarding the existing recommendation, shopping-boundary, truth-metrics, or security work.

## VERIFIED
- The existing classic Alexa Skills Kit / Shopping Kit adapter remains intact in `src/index.js`.
- The launch branch now contains a self-hosted MCP server in `src/mcp-server.js` using the official Model Context Protocol server + Node packages.
- `/mcp` serves the commerce tools over Streamable HTTP and supports the Alexa+ minimum MCP `2025-11-25` path.
- The MCP surface exposes `list_categories`, `recommend_product`, and `prepare_amazon_cart_handoff`.
- The recommendation tool exposes matched/unmatched criteria and does not claim purchase or commission.
- The handoff tool requires explicit shopper confirmation and truthfully reports that the MCP server itself did not execute the final Amazon purchase.
- `public/index.html` is a judge-facing simulator that exercises the real `/mcp` tool path rather than a parallel fake recommendation API.
- `docs/HACKATHON_SUBMISSION.md` contains judge instructions, architecture, demo script, technical challenges, and truthful submission language.
- CI run `35932297275` completed successfully at exact implementation SHA `b77d751123dccc5aff639dfa6c2c0be0296c63a3`.
- The successful CI run includes source/unit/MCP protocol checks, production dependency audit, Playwright Chromium judge-flow verification, browser-proof artifact upload, leak checks, Lambda packaging, and fresh-unzip classic Alexa runtime smoke.
- CI produced browser proof artifact `alexa-commerce-browser-proof-b77d751123dccc5aff639dfa6c2c0be0296c63a3` and build artifact `alexa-commerce-engine-b77d751123dccc5aff639dfa6c2c0be0296c63a3`.

## FIX
- Added Alexa+ MCP runtime adapter without replacing the proven commerce core.
- Added a browser simulator and real MCP browser path.
- Added MCP protocol tests including `2025-11-25` initialization and tool calls.
- Added Playwright end-to-end judge-flow proof.
- Added launch/submission documentation.
- Hardened CI so browser proof and a reproducible runtime artifact are generated on each exact head.

## PROOF
- Workflow run: `35932297275` — success.
- Exact implementation head: `b77d751123dccc5aff639dfa6c2c0be0296c63a3`.
- Playwright judge flow: success.
- MCP protocol/unit verification: success.
- Production dependency audit: success.
- Secret/leak package inspection: success.
- Fresh-unzip classic Alexa Lambda runtime smoke: success.
- Browser proof artifact digest: `sha256:33cd143726d2977e43c124b433fceb417ab916711f9aa2b58d3d5a62ffe1a694`.
- Build artifact digest: `sha256:f215963fa35aed4f4fbd973dfff071462bad275ff5be6c441c4ea9eb68c7fb2c`.

## UNKNOWN
- Whether the required Amazon/Devpost reviewer collaborators are currently configured on the private repo.
- Whether the Devpost submission draft, product-feedback answers, and final under-three-minute demo video are complete outside this repository.
- Whether a public deployment is desired. The hackathon FAQ says a locally runnable repo plus demo video is acceptable, so hosting is not required for eligibility.

## RISK
- `prepare_amazon_cart_handoff` intentionally prepares the boundary but does not claim that the MCP server can complete an Amazon purchase. A production provider-authorized purchase adapter remains separate work.
- The repository is private, so judge access must be verified before submission.
- Submission packaging outside GitHub can still block launch even though the repository path is green.

## ROLLBACK
- Before merge, reset `fix/audit-truth-metrics` to `b73b3bc718459864e2427ece484a32b98fc2f1ed` to remove the Alexa+ launch adapter while retaining the earlier hardening work.
- After a fast-forward merge, move `main` back to `f23323a684335aa8108abc9bc2ecff5b63eb22d3` only if the entire hardening + launch sequence must be reversed.

## NEXT GATE
Run exact-head CI for this receipt-only commit, then fast-forward `main` only if it remains green. After merge, the remaining launch gates are judge-repository access plus the Devpost submission/video package.
