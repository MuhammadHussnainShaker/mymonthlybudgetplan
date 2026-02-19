import { Link, useNavigate, useLocation } from 'react-router'
import Container from '@/components/layout/container/Container'
import useUserStore from '@/store/useUserStore'
import LogoutBtn from '@/components/layout/Header/LogoutBtn'
import useMonthStore from '@/store/useMonthStore'
import isoDateToYYYYMM from '@/utils/date-manipulators/isoDateToYYYYMM'

export default function Header() {
  const isAuthenticated = useUserStore((state) => state.user.isAuthenticated)
  const month = useMonthStore((state) => state.month)
  const setMonth = useMonthStore((state) => state.setMonth)
  const navigate = useNavigate()
  const isDailyExpenseActive =
    useLocation().pathname.startsWith('/daily-expenses')

  const navItems = [
    { name: 'Signup', slug: '/signup', active: !isAuthenticated },
    { name: 'Login', slug: '/login', active: !isAuthenticated },
    { name: 'Dashboard', slug: '/dashboard', active: isAuthenticated },
    {
      name: 'Monthly Expenses',
      slug: '/monthly-expenses',
      active: isAuthenticated,
    },
    {
      name: 'Daily Expenses',
      slug: '/daily-expenses',
      active: isAuthenticated,
    },
    { name: 'Profile', slug: '/user-profile', active: isAuthenticated },
  ]

  return (
    <header className='border-b border-slate-700/50'>
      <Container>
        <nav className='flex flex-wrap items-center justify-between gap-3 py-3'>
          <Link to='/' className='font-medium'>
            Home Budgeting
          </Link>

          <ul className='flex flex-wrap items-center justify-end gap-2'>
            {isAuthenticated && (
              <li>
                {!isDailyExpenseActive && (
                  <div className='flex items-center gap-2'>
                    <label className='text-sm sr-only' htmlFor='budget-month'>
                      Month
                    </label>
                    <input
                      className='rounded border border-slate-700/50 bg-transparent px-2 py-1 text-sm'
                      type='month'
                      name='budget-month'
                      id='budget-month'
                      value={isoDateToYYYYMM(month)}
                      onChange={(e) => {
                        const value = e.target.value
                        if (!value) return
                        setMonth(value)
                      }}
                    />
                  </div>
                )}
              </li>
            )}
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    className='px-3 py-1.5 rounded border border-slate-700/50'
                    onClick={() => navigate(item.slug)}
                  >
                    {item.name}
                  </button>
                </li>
              ) : null,
            )}

            {isAuthenticated && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
