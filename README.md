# Alexa Commerce Engine

A multi-category Alexa Shopping Kit engine for product discovery, recommendation, shopping handoff, and revenue attribution.

## Current seed categories

- Wireless earbuds
- Air fryers
- Robot vacuums
- Resistance bands
- LED strip lights
- Tumblers / water bottles

The catalog is data-driven so a new category is an extension to `src/catalog.js`, not a new skill architecture.

## Voice flow

`category -> budget -> priority -> optional context -> recommendation -> explicit yes/no -> AMAZON.AddToShoppingCart`

Amazon controls the shopping dialog after the handoff. The skill never treats a cart result as proof of payment or commission.

## Money truth

`invocation -> completed qualifier flow -> recommendation -> cart handoff -> successful cart action -> qualifying purchase -> commission`

Only the final Associates earnings/reporting receipt proves revenue.

## Local verification

```bash
npm install
npm run verify
```

## Alexa setup

1. Create a Custom Alexa skill.
2. Use invocation name `shopping compass` or choose a final brand before certification.
3. Deploy `src/` with `ask-sdk-core`.
4. Import `skill-package/interactionModels/custom/en-US.json`.
5. Enable Alexa Shopping Kit in Privacy & Compliance.
6. Keep Associates disabled until the skill has been certified and published once.
7. Test every recommendation path and `AMAZON.AddToShoppingCart` in the Alexa Simulator.
8. Publish/certify the skill.
9. Register the published skill for Amazon Associates on Alexa.
10. Enable Associates and supply IDs through secure environment variables:
   - `ASSOCIATES_ENABLED=true`
   - `AMAZON_ASSOCIATES_ID`
   - `AMAZON_TRACKING_ID`
11. Re-test attribution and resubmit if required by Amazon.

## Proof boundaries

- Source code green != Alexa runtime green.
- Alexa simulator green != published skill.
- Add-to-cart != purchase.
- Purchase != commission until the Associates receipt exists.
