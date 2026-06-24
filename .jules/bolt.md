## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Optimize BFS Algorithm with Flat Coordinates
**Learning:** In hot path BFS grid traversal, allocating objects inside closures (e.g. `directions.forEach({x, y})`) and creating Map keys via string interpolation (e.g. `${x},${y}`) causes measurable GC pauses. Replacing these with flat directional arrays (`dirX`, `dirY`) and 1D integer indexing (`y * width + x`) doubles performance.
**Action:** Always prefer 1D integer keys and primitive flat arrays over object allocation and string interpolation in hot loops (like pathfinding).

## 2026-06-23 - Fast Pathfinding Collision Detection using WeakMap
**Learning:** The `isBlocked` function, calculating if coordinates are passable, is a massive hot path during pathfinding (BFS). Because map layout objects (buildings, water, warps) don't mutate, computing grid status at runtime via iterative array scans (O(N) for water arrays + building arrays) creates a huge performance penalty (~460ms for 250k BFS node checks).
**Action:** Use a `WeakMap` bound to the static map object to memoize its collision data into a 1D `Uint8Array` as a persistent cache. The transition to O(1) typed-array lookups yielded a ~3x performance gain for pathfinding algorithms while ensuring proper GC when the map is unused.
