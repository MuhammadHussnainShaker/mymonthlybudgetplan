import yyyyMMToISODate from '@/utils/date-manipulators/yyyyMMToISODate'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// const demoMonth = '2026-01-01T00:00:00.000Z'

const getCurrentMonthStartISO = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const monthIndex = now.getUTCMonth()
  const monthStart = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0))
  return monthStart.toISOString()
}

const useMonthStore = create()(
  persist(
    (set) => ({
      month: getCurrentMonthStartISO(),
      setMonth: (newMonth) => {
        // Guard against empty or invalid month values to avoid crashing the app
        if (typeof newMonth !== 'string' || newMonth.trim() === '') {
          // Ignore invalid updates and keep the existing month
          return
        }

        try {
          const isoMonth = yyyyMMToISODate(newMonth)
          if (!isoMonth) return
          set({ month: isoMonth })
        } catch {
          // If conversion fails, ignore the update to prevent runtime errors
          return
        }
      },
    }),
    {
      name: 'month-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useMonthStore
