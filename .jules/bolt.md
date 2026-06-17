## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Optimize BFS Algorithm with Flat Coordinates
**Learning:** In hot path BFS grid traversal, allocating objects inside closures (e.g. `directions.forEach({x, y})`) and creating Map keys via string interpolation (e.g. `${x},${y}`) causes measurable GC pauses. Replacing these with flat directional arrays (`dirX`, `dirY`) and 1D integer indexing (`y * width + x`) doubles performance.
**Action:** Always prefer 1D integer keys and primitive flat arrays over object allocation and string interpolation in hot loops (like pathfinding).
