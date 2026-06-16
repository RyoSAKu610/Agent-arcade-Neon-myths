## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.
## 2026-06-05 - BFS Pathfinding Optimization Pattern
**Learning:** In high-frequency JavaScript game loops, BFS pathfinding bottlenecks are often caused by key generation overhead (string interpolation `,`) and intermediate object allocations (e.g., `{x: nx, y: ny}` before validation, closure callbacks in `forEach`).
**Action:** Replace string keys with 1D integer keys (`y * width + x`), convert callback iterations to standard `for` loops with parallel arrays (`dirX`, `dirY`), and defer object allocation until after validity checks.
