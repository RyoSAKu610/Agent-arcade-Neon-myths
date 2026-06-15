## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.
## 2026-06-15 - Typed Arrays vs Sparse Maps in BFS Pathfinding
**Learning:** While typed arrays (e.g., `Uint8Array`) offer fast O(1) lookups and eliminate object allocation, allocating them scaled to the entire map dimensions on every BFS call causes huge memory regressions and garbage collection overhead when the map is large. Using sparse `Set` and `Map` collections with 1D integer indexing (`y * width + x`) correctly restricts memory use to O(ExploredNodes) while avoiding string interpolation overhead.
**Action:** Use native sparse data structures (`Set`, `Map`) with 1D integer keys instead of full-size arrays or string keys for grid-based pathfinding state tracking.
