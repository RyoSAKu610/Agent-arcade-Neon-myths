## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2026-06-13 - Optimize Pathfinding Inner Loop
**Learning:** In hot path loop algorithms like BFS pathfinding on a grid, using an array of direction objects `[{x: 1, y: 0}, ...]` and `.forEach` incurs massive function closure overhead and triggers continuous object allocations. Using flat parallel arrays `dirX = [1, -1, 0, 0]` and `dirY = [0, 0, 1, -1]` with a standard `for` loop avoids these allocations, bringing runtimes down by ~68%.
**Action:** Always replace object-array iterators with parallel primitive arrays and standard `for` loops in hot path spatial grid traversals.
