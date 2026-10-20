// One-shot navigation intents passed between dashboard views (e.g. the chat's
// Message of the Day asking Courses to open the Daily Puzzle on mount).
let openPuzzlePending = false

export function requestOpenPuzzle() {
  openPuzzlePending = true
}

export function consumeOpenPuzzle() {
  const pending = openPuzzlePending
  openPuzzlePending = false
  return pending
}
