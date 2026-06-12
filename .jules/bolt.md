## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.
## 2026-06-12 - Optimize Pathfinding Allocation
**Learning:** Replaced object-based directional array and `Array.prototype.forEach` with flat coordinate arrays and a standard `for` loop in BFS pathfinding. This avoids function closure overhead and object allocations per traversal loop iteration, speeding up the pathfinder significantly.
**Action:** Use flat arrays (`dirX`, `dirY`) and basic `for` loops in high-frequency matrix/grid traversal functions.
