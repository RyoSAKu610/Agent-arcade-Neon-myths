
## 2025-05-31 - Spatial 2D Array vs Array.find vs Map String Interpolation
**Learning:** For frequent spatial coordinate lookups in V8, a pre-computed 2D array grid (`arr[y][x]`) is significantly faster (~12x) than `Array.prototype.find()` and also faster than standard `Map` lookups that require string interpolation (`${x},${y}`) for keys.
**Action:** Use 2D arrays instead of Maps with string keys when bounded, integer coordinate grids are involved in high-frequency rendering or game loops.

## 2025-05-31 - O(1) Map Lookups for React Rendering
**Learning:** Re-computing arrays using spread syntax inside `useMemo` and then scanning them with `Array.prototype.find()` creates O(N) bottlenecks during frequent re-renders. Replacing the scan with a pre-computed Map inside the same `useMemo` (e.g. `allMap.get(id)`) drastically reduces lookup overhead and speeds up rendering paths.
**Action:** Whenever iterating or scanning an array frequently in a React render cycle (like looking up an entity by ID), generate an O(1) Map lookup table alongside the array creation.
