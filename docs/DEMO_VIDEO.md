# Shopping Compass — Final Demo Video Package

Target length: 2:40–2:55. Public YouTube or Vimeo. English. No copyrighted music.

## Story
Shopping Compass turns conversational shopping intent into a transparent recommendation, then requires explicit confirmation before preparing an Amazon handoff. The demo must show the real browser → MCP → commerce-engine path, not a mock.

## Shot list + narration

### 0:00–0:15 — Hook
**Visual:** Shopping Compass home screen.

**Narration:**
“Shopping by voice is easy. Knowing why a product was recommended, and what the assistant is actually authorized to do, is harder. Shopping Compass makes both visible.”

### 0:15–0:35 — Alexa+ / MCP proof
**Visual:** Briefly show `/health` and the repo files `src/mcp-server.js` and `package.json`.

**Narration:**
“This is a self-hosted Alexa+ compatible MCP server using Streamable HTTP and MCP 2025-11-25. The browser demo calls the same MCP tool path the agent uses.”

### 0:35–1:20 — Real recommendation journey
**Visual:** In the simulator choose a category, budget, priority, and household context. Click **Find my best match**. Hold on the returned recommendation and matched/unmatched criteria.

**Narration:**
“I can give it the shopper’s category, budget, priority, and household context. The commerce engine ranks the catalog deterministically and returns both the recommendation and the evidence behind it. It also shows which constraints did not match, instead of pretending the result is perfect.”

### 1:20–1:55 — Authority boundary
**Visual:** Click **Confirm & prepare Amazon handoff**. Show the proof payload.

**Narration:**
“A shopping action requires explicit confirmation. Shopping Compass prepares the Amazon handoff, but it does not claim that a purchase happened or that commission was earned. Recommendation, handoff, cart, purchase, and revenue remain separate proof states.”

### 1:55–2:20 — MCP tools
**Visual:** Show the tool names in the source or tool list: `list_categories`, `recommend_product`, `prepare_amazon_cart_handoff`.

**Narration:**
“The MCP surface stays small: discover supported categories, recommend a product, and prepare an authorized handoff. New product categories are data extensions, not new Alexa skills.”

### 2:20–2:45 — Engineering proof
**Visual:** Show the successful GitHub Actions run and Playwright browser-proof artifact.

**Narration:**
“The exact repository head is verified with protocol tests, dependency audit, Playwright end-to-end browser proof, packaging checks, and a fresh runtime smoke test.”

### 2:45–2:55 — Close
**Visual:** Return to Shopping Compass result screen.

**Narration:**
“Shopping Compass turns natural shopping intent into bounded, inspectable action for Alexa+.”

## Capture requirements

- Record the real running project, not slides standing in for functionality.
- Keep browser zoom high enough that recommendation evidence is readable.
- Do not show secrets, environment variables, private account data, or GitHub tokens.
- Do not imply that the MCP server completes an Amazon purchase.
- Use the Playwright-recorded browser video as the clean proof segment when useful.
- Keep final export under 3 minutes.

## Required final upload

1. Export MP4.
2. Upload publicly to YouTube or Vimeo.
3. Confirm anonymous playback works.
4. Add the public URL to the Devpost project and submission.
