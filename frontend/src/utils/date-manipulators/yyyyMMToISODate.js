export default function yyyyMMToISODate (monthInput) {
  const dateString = `${monthInput}-01`
  const dateObj = new Date(dateString)
  return dateObj.toISOString()
}
