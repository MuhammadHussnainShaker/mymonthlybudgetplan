export default function isoDateToYYYYMM (isoDate) {
  if (!isoDate) return ''
  return isoDate.slice(0, 7)
}