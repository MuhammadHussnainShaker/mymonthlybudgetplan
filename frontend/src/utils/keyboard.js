export function createKeyDownHandler(onEscape) {
  return (event) => {
    if (event.key === 'Enter') event.target.blur()
    else if (event.key === 'Escape') onEscape()
  }
}
