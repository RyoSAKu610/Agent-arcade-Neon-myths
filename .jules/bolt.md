
## 2024-05-18 - Consolidate chained array methods
**Learning:** Found sequential `.map().filter()` chains running on every game tick, causing unnecessary intermediate array allocations which is inefficient.
**Action:** Combined `.map()` and `.filter()` into a single `.reduce()` pass for array iterations, especially during frequent React state updates like game loop ticks.
