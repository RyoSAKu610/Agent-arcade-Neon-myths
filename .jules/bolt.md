## 2024-05-16 - Consolidation of React State Updates and Array Operations
**Learning:** Chained `.map().filter()` array operations on state variable updates coupled with consecutive state update calls to the same variable can be combined to drastically reduce overhead, prevent intermediate allocations, and avoid multiple queued render triggers.
**Action:** When updating React state from prior state via `prev => ...`, identify consecutive updates or chained array modifiers and merge them into a single update leveraging `.reduce()` to iterate the state array only once.

## 2024-05-18 - Avoid Intermediate Array Spread Allocations in Tick Loops
**Learning:** Using array spread and `.filter` operations (e.g., `[...agents, ...resi].filter(x => ...)` ) inside high-frequency game tick intervals creates multiple intermediate array allocations that create noticeable GC (Garbage Collection) overhead in JavaScript, which impacts performance.
**Action:** When filtering combined datasets in hot loops, use sequential `for` loops instead to directly push qualifying items into a single new array (`workers.push()`). This eliminates unnecessary intermediary array creation.
