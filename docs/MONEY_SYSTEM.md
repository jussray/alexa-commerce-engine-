# Money System

## Objective

Build a reusable Alexa commerce engine that learns which categories, recommendation reasons, and product segments produce commercial outcomes.

## Event ladder

1. `recommendation_made`
2. `recommendation_declined`
3. `cart_handoff_started`
4. `shopping_action_resumed`
5. qualifying purchase
6. Associates commission

Events 1-4 are operational evidence only. Events 5-6 require Amazon/Associates evidence outside the skill runtime.

## Required dimensions

Each recommendation event carries:

- category
- product key
- ASIN
- price tier
- timestamp

Associates tracking IDs should later segment meaningful recommendation groups instead of creating one opaque revenue bucket.

## Decision rule

Optimize on verified commercial outcomes, not invocation count.

`PUBLIC != REVENUE`
`CART != REVENUE`
`COMMISSION RECEIPT = REVENUE PROOF`
