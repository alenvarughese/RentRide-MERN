import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar transparent={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
