## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Optimize BFS Algorithm with Flat Coordinates
**Learning:** In hot path BFS grid traversal, allocating objects inside closures (e.g. `directions.forEach({x, y})`) and creating Map keys via string interpolation (e.g. `${x},${y}`) causes measurable GC pauses. Replacing these with flat directional arrays (`dirX`, `dirY`) and 1D integer indexing (`y * width + x`) doubles performance.
**Action:** Always prefer 1D integer keys and primitive flat arrays over object allocation and string interpolation in hot loops (like pathfinding).
## 2024-10-27 - Optimize Spatial Lookups in Pathfinding
**Learning:** Checking coordinate blocking state dynamically over O(N) array loops inside a high-frequency pathfinding algorithm (BFS) introduces a severe performance bottleneck. A lazily populated 2D array cache (`grid[y][x]`) combined with a `WeakMap` eliminates this bottleneck completely while avoiding memory leaks.
**Action:** When evaluating block state/collision during grid traversals, lazily cache lookup states in 2D arrays keyed via `WeakMap` by map reference to convert O(N) spatial entity lookups into O(1) checks.
