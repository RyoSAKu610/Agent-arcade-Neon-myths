## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Optimize BFS Algorithm with Flat Coordinates
**Learning:** In hot path BFS grid traversal, allocating objects inside closures (e.g. `directions.forEach({x, y})`) and creating Map keys via string interpolation (e.g. `${x},${y}`) causes measurable GC pauses. Replacing these with flat directional arrays (`dirX`, `dirY`) and 1D integer indexing (`y * width + x`) doubles performance.
**Action:** Always prefer 1D integer keys and primitive flat arrays over object allocation and string interpolation in hot loops (like pathfinding).
## 2024-05-19 - Avoid Caching Mutable Map State
**Learning:** Attempting to pre-compute and cache map collision grids using a `WeakMap` is dangerous if the game map objects might mutate at runtime (e.g., adding a building). This can lead to stale state bugs. Furthermore, generating a full 1000x1000 grid upfront for a BFS search that only explores 50 nodes ruins performance.
**Action:** When using a `WeakMap` to cache computed data keyed by an object reference, ensure the underlying object properties do not mutate during runtime, otherwise the cache will become stale. Favor stateless optimizations (like loop unrolling or inline checks) when cache invalidation adds excessive risk or complexity.

## 2024-05-19 - Avoid Callbacks in Hot Paths
**Learning:** Replacing array iteration methods with callbacks (like `Array.prototype.some`) with standard `for` loops in frequently called functions (e.g., collision detection and rendering checks) avoids closure allocation overhead. Benchmarks showed a measurable performance improvement for `isBlocked`.
**Action:** Always prefer standard `for` loops over `Array.prototype.some` or `.forEach` in hot map collision and rendering paths.
