import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineMenuAlt3, HiOutlineX,
  HiOutlineUser, HiOutlineLogout,
  HiOutlineViewGrid, HiChevronDown
} from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'

export default function Navbar({ transparent }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/vehicles', label: 'Vehicles' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  const navBg = transparent && !scrolled && !mobileOpen
    ? 'bg-transparent'
    : 'bg-dark-950/95 backdrop-blur-md border-b border-dark-800'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-500 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
              <MdDirectionsCar className="text-white text-xl" />
            </div>
            <span className="font-display text-2xl text-white tracking-widest">
              RENT<span className="text-brand-500">RIDE</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {!isAdmin && navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-heading font-semibold tracking-widest uppercase text-sm px-4 py-2 transition-colors duration-200 ${
                    isActive ? 'text-brand-400' : 'text-dark-300 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <div className="font-heading font-semibold tracking-widest uppercase text-sm px-4 py-2 text-brand-400">
                Administrative Control Panel
              </div>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors font-heading font-semibold tracking-wider uppercase text-sm"
                >
                  <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/50 flex items-center justify-center">
                    <HiOutlineUser className="text-brand-400" />
                  </div>
                  {user.name}
                  <HiChevronDown className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 bg-dark-900 border border-dark-700 min-w-[180px] z-50">
                    <Link
                      to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-dark-300 hover:text-white hover:bg-dark-800 transition-colors font-heading text-sm tracking-wider uppercase"
                    >
                      <HiOutlineViewGrid /> {isAdmin ? "Admin Panel" : "Dashboard"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-dark-800 transition-colors font-heading text-sm tracking-wider uppercase"
                    >
                      <HiOutlineLogout /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-dark-300 hover:text-white text-2xl transition-colors"
          >
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-dark-950 border-t border-dark-800">
          <div className="px-4 py-6 space-y-1">
            {!isAdmin ? navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block font-heading font-semibold tracking-widest uppercase text-sm px-4 py-3 transition-colors ${
                    isActive ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            )) : (
              <div className="px-4 py-3 text-brand-400 font-heading text-sm tracking-widest uppercase">
                Admin Panel
              </div>
            )}
            <div className="pt-4 border-t border-dark-800 space-y-2">
              {user ? (
                <>
                  <Link
                    to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className="block btn-outline text-center text-sm py-2"
                  >
                    {isAdmin ? "Admin Panel" : "Dashboard"}
                  </Link>
                  <button onClick={handleLogout} className="w-full text-red-400 font-heading font-semibold tracking-wider uppercase text-sm py-2">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block btn-outline text-center text-sm py-2">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block btn-primary text-center text-sm py-2">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
