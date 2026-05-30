## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.
## 2024-05-30 - Optimize Array Merging and Filtering in Game Loop
**Learning:** Using array spread syntax followed by `.filter()` (e.g., `[...arr1, ...arr2].filter(cond)`) inside a high-frequency game loop creates unnecessary intermediate arrays, leading to increased Garbage Collection (GC) pauses.
**Action:** Replace `[...arr1, ...arr2].filter(cond)` with sequential `for` loops that directly push items matching the condition into a single output array, significantly reducing memory allocations and GC overhead in hot paths.
