## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Avoid spread and filter intermediate array allocation
**Learning:** In hot React game loops, patterns like `[...agents, ...resi].filter(...)` create multiple intermediate arrays (one for spread, one for filter), generating significant GC pressure. This is particularly problematic in single-file React apps where the state updates frequently (e.g. `requestAnimationFrame` or `setTimeout` ticks).
**Action:** Replace `[...arr1, ...arr2].filter(...)` with sequential `for` loops that push items directly into a single result array to reduce GC overhead.
