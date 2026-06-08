## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.
## 2024-05-18 - Lazy 2D Grid Caching
**Learning:** For continuous spatial queries (like `isBlocked` in pathfinding) on fixed maps, caching results in a lazy 2D array structure `grid[y][x]` keyed by a `WeakMap(map)` reduces Amortized O(N) array scans to O(1) without requiring up-front full-map initialization, drastically speeding up game loops (~4x improvement).
**Action:** Apply lazy 2D grid caches via `WeakMap` for any hot-path spatial query over static map terrain/entities instead of recomputing intersections every frame.
