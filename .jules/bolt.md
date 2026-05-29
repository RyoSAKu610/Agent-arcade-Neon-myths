## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.

## 2024-05-29 - Array Allocation in Game Loops
**Learning:** Using spread operators and array methods like `.filter()` (`[...arr1, ...arr2].filter(...)`) inside high-frequency game loops creates unnecessary intermediate array allocations that increase garbage collection overhead.
**Action:** Replace these chained functional array operations with sequential `for` loops pushing elements into a reusable array to reduce memory allocations and avoid GC pauses in hot paths.
