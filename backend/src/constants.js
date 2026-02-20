export const DB_NAME =
  process.env.NODE_ENV === 'production'
    ? 'homebudgetingdbprod'
    : 'homebudgetingdbdev'