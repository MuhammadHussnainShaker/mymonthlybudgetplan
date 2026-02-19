export function addItemToList(list, item) {
  return [...list, item]
}

export function updateItemInList(list, item, idField = '_id') {
  const itemId = item?.[idField]
  return list.some((existing) => existing?.[idField] === itemId)
    ? list.map((existing) => (existing?.[idField] === itemId ? item : existing))
    : [item, ...list]
}

export function removeItemFromList(list, itemId, idField = '_id') {
  return list.filter((item) => item?.[idField] !== itemId)
}
