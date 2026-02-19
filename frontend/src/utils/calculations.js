export function toNumber(value) {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function sumBy(items, key) {
  return items.reduce((sum, item) => sum + toNumber(item?.[key]), 0)
}

export function calculateDifference(projected, actual, projMinusActual = true) {
  return projMinusActual
    ? toNumber(projected) - toNumber(actual)
    : toNumber(actual) - toNumber(projected)
}

export function calculateProjectedActualTotals(
  items,
  { projectedKey = 'projectedAmount', actualKey = 'actualAmount', differenceMode = 'actualMinusProjected' } = {},
) {
  const projectedTotal = sumBy(items, projectedKey)
  const actualTotal = sumBy(items, actualKey)
  const difference =
    differenceMode === 'projectedMinusActual'
      ? projectedTotal - actualTotal
      : actualTotal - projectedTotal

  return { projectedTotal, actualTotal, difference }
}

export function calculateParentTotals(
  items,
  { parentIdKey = 'parentId', projectedKey = 'projectedAmount', actualKey = 'actualAmount' } = {},
) {
  const byParent = Object.create(null)
  const grand = { projectedTotal: 0, actualTotal: 0, difference: 0 }

  for (const item of items) {
    const parentKey = String(item?.[parentIdKey] ?? '')

    if (!byParent[parentKey]) {
      byParent[parentKey] = { projectedTotal: 0, actualTotal: 0, difference: 0 }
    }

    const projected = toNumber(item?.[projectedKey])
    const actual = toNumber(item?.[actualKey])

    byParent[parentKey].projectedTotal += projected
    byParent[parentKey].actualTotal += actual

    grand.projectedTotal += projected
    grand.actualTotal += actual
  }

  for (const key of Object.keys(byParent)) {
    byParent[key].difference = byParent[key].projectedTotal - byParent[key].actualTotal
  }

  grand.difference = grand.projectedTotal - grand.actualTotal

  return { byParent, grand }
}
