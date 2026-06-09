## 2024-05-24 - Array allocation during coordinate caching
**Learning:** During grid pathfinding in JS, accessing a 2D array by uninitialized negative indices (e.g. `seen[-1][-1]`) can silently trigger V8 to de-optimize the array into a hash map or allocate unnecessary properties, reducing performance.
**Action:** Always perform strict bounds checking (`x < 0 || y < 0`) before accessing or initializing rows in 2D coordinate caches during pathfinding to maintain contiguous array structures.

## 2024-05-24 - String Interpolation vs 2D Arrays in tight loops
**Learning:** In tight pathfinding loops (like BFS), using `Set` or `Map` with string interpolated keys (e.g., `` `${x},${y}` ``) introduces massive GC pressure and is significantly slower than using a sparse 2D array (e.g., `seen[y][x]`).
**Action:** Replace coordinate string hashing with 2D arrays (`arr[y][x]`) when tracking visited/parent nodes in grid-based algorithms.
