import { Outlet } from 'react-router'
import { Footer, Header } from '@/components'

function App() {
  return (
    <div className='min-h-screen'>
      <Header />
      <main className='py-6'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default App
