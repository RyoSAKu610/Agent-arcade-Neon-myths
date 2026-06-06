## 2026-06-04 - Optimize Building Lookup
**Learning:** Pre-computing a 2D grid array for spatial lookups (O(1)) is significantly faster (~6.4x) than using Array.prototype.find (O(N)) for fixed building positions in the game loop.
**Action:** Use a 2D array grid for spatial mapping of static entities instead of dynamic Array searches.
## 2026-06-06 - Object Reference Caching Risks
**Learning:** Using a standard `Map` keyed by an assumed identifier property (e.g., `map.id`) for caching object data can lead to severe issues: if the property doesn't exist, it hallucinates a cache key of `undefined`, causing cache collisions for all objects without that ID. Additionally, standard `Map` caches create strong references, leading to memory leaks if objects are dynamically created or discarded.
**Action:** Use a `WeakMap` keyed by the object instance reference itself (`_gridCache.set(map, grid)`) when caching computed properties for complex objects to ensure safety, correctness, and automatic garbage collection.
