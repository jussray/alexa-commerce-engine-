# Architecture

```text
Alexa custom skill
  -> intent / slot collection
  -> recommendation-engine
  -> category catalog
  -> explicit shopping consent
  -> shopping-actions adapter
  -> Alexa Shopping Kit
  -> Amazon cart / purchase surface
  -> Associates attribution
  -> external earnings receipt
```

## Authority boundaries

- `src/catalog.js` is the seed product/config source.
- `src/recommendation-engine.js` ranks eligible catalog candidates.
- `src/shopping-actions.js` owns Alexa Shopping directives and Associates attribution.
- `src/index.js` owns voice orchestration and evidence events.
- Alexa owns the shopping dialog after `Connections.StartConnection`.
- Amazon/Associates owns purchase and commission truth.

## Expansion rule

Add categories through catalog/config first. Add category-specific ranking logic only when evidence shows generic scoring is insufficient.
