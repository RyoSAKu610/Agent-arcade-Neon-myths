1. **Add `PLAY NOW` button to loading screen HTML**
   - Insert `<button id="nm-play-btn">PLAY NOW</button>` inside the `#nm-loading` div, initially hidden.
2. **Remove automatic fade-out**
   - Modify the React initialization block to not automatically remove the loading screen.
3. **Show `PLAY NOW` button after loading text finishes**
   - Update `enhanceLoader` to show the `nm-play-btn` after the status text cycle completes.
   - Attach a click listener to the button to fade out the loading screen.
4. **Pre-commit checks**
   - Run `pre_commit_instructions` before submitting to ensure we meet all the pre-commit checks.
5. **Submit**
   - Call `submit` with the changes.
