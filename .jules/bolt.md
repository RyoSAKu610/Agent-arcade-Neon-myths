## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.
## 2024-05-17 - Spatial Hash Map for Frequent Lookups
**Learning:** Functions that frequently scan arrays for coordinate matching in a hot path (e.g., AI loop tick) are bottlenecks. Using an array `.find()` in O(N) limits scale.
**Action:** When searching entities by coordinates, cache hits in a standard JavaScript `Map()` keyed by coordinate strings (e.g., `x,y`) to change lookup complexity to O(1).
