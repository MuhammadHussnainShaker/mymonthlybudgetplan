import { Outlet } from 'react-router'
import { Footer, Header } from '@/components'

function App() {
  return (
    <div className='min-h-dvh flex flex-col'>
      <Header />
      <main className='flex-1 flex items-center justify-center py-6 '>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
