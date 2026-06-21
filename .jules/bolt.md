## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Optimize BFS Algorithm with Flat Coordinates
**Learning:** In hot path BFS grid traversal, allocating objects inside closures (e.g. `directions.forEach({x, y})`) and creating Map keys via string interpolation (e.g. `${x},${y}`) causes measurable GC pauses. Replacing these with flat directional arrays (`dirX`, `dirY`) and 1D integer indexing (`y * width + x`) doubles performance.
**Action:** Always prefer 1D integer keys and primitive flat arrays over object allocation and string interpolation in hot loops (like pathfinding).

## 2024-05-18 - Optimize Collision Map Cache and Checks
**Learning:** Performance in high-frequency map lookups (like `isBlocked`) suffers heavily from iterating over unused arrays (e.g., checking `road`, `plaza`, and `garden` tiles when only `water` and `buildings` block movement). Using lazy-evaluated 2D grid arrays combined with a WeakMap to cache collision states is far more efficient than recalculating collisions on every pathfinding tick.
**Action:** Always prefer lazy 2D grids for O(1) map state caching, use WeakMap to avoid leaking memory when references drop, and avoid generalized utility functions (like `tileKind`) in hot paths if they perform redundant checks.
