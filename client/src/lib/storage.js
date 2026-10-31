const KEY = 'saathi.state'

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {}
  } catch {
    return {}
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Progress is a convenience, so the app keeps working without storage.
  }
}
