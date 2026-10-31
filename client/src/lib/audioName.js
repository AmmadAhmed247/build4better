// Same text always maps to the same recorded file.
export function audioName(voice, text) {
  let hash = 5381
  for (const character of text) {
    hash = (hash * 33 + character.codePointAt(0)) >>> 0
  }
  return `${voice}-${hash.toString(36)}-${text.length}`
}
