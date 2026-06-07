## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.

## 2024-05-18 - Lazy Evaluation for Spatial Grid Caches
**Learning:** Eagerly computing entire 2D map grids for collision detection causes large latency spikes on the first execution, defeating the purpose of an optimization.
**Action:** When caching spatial grids, use lazy evaluation (computing cells on-demand with a state system like 0=uncomputed, 1=blocked, 2=open) to spread the work across frames.
