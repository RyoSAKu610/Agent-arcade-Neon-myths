## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.

## 2024-05-28 - Eliminating intermediate array allocations in game loop
**Learning:** Using `[...arr1, ...arr2].filter(...)` in a high-frequency game loop (like the 60fps tick loop) creates multiple intermediate arrays that must be immediately garbage-collected. This can cause micro-stutters and frame drops.
**Action:** In high-frequency code paths, replace spread operators and `.filter()` over concatenated arrays with sequential `for` loops pushing to a single, pre-allocated or shared array.
