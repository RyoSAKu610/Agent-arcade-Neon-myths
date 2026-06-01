## 2024-06-01 - O(1) Spatial Lookups via Pre-computed Grid
**Learning:** For spatial coordinate lookups of small, fixed datasets (e.g., buildings in a map) in V8, a pre-computed 2D array grid (e.g., `grid[y][x]`) outperforms `Array.prototype.find()` by ~10x, avoiding O(N) array scans during high-frequency calls like game loops.
**Action:** Use pre-computed 2D array grids instead of `Array.find()` or Map lookups with string interpolation overhead when doing frequent spatial queries on fixed layouts.
