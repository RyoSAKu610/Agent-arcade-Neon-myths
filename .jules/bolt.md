## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.
## 2024-05-25 - Spatial Hash Map Lookups Can Still Have Overhead for Small N
**Learning:** When optimizing lookups for very small datasets (e.g. N < 15 items) in V8/Node.js, O(N) array scans (`Array.prototype.find()`) can sometimes outperform O(1) Map lookups if generating the Map key requires relatively expensive string interpolation (`${x},${y}`).
**Action:** Measure actual impact before assuming asymptotic complexity (O(1) > O(N)) wins. For small N, caching and avoiding string allocations may matter more than algorithmic complexity.
