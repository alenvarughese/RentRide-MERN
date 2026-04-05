import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiOutlineMail, HiOutlineLockClosed, HiArrowRight, HiEye, HiEyeOff } from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  // Demo login
  const demoLogin = async () => {
    setLoading(true)
    try {
      setForm({ email: 'demo@rentride.in', password: 'demo123' })
      await new Promise(r => setTimeout(r, 800))
      toast.success('Logged in as Demo User')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-900">
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/60 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-500 flex items-center justify-center">
              <MdDirectionsCar className="text-white text-xl" />
            </div>
            <span className="font-display text-2xl text-white tracking-widest">
              RENT<span className="text-brand-500">RIDE</span>
            </span>
          </Link>
          <div>
            <h2 className="font-display text-6xl text-white mb-4">WELCOME<br />BACK</h2>
            <p className="text-dark-300 text-lg max-w-xs">
              Your next adventure is waiting. Log in to access your bookings and fleet.
            </p>
          </div>
          <div className="flex gap-6">
            {[{ value: '1,200+', label: 'Vehicles' }, { value: '100+', label: 'Cities' }, { value: '4.8★', label: 'Rating' }].map(s => (
              <div key={s.label}>
                <div className="font-display text-2xl text-brand-400">{s.value}</div>
                <div className="text-dark-500 text-xs font-heading uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="mb-3">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-brand-500 flex items-center justify-center">
                <MdDirectionsCar className="text-white text-lg" />
              </div>
              <span className="font-display text-xl text-white tracking-widest">RENT<span className="text-brand-500">RIDE</span></span>
            </Link>
            <p className="section-subtitle mb-2">Welcome Back</p>
            <h1 className="font-display text-4xl text-white">SIGN IN</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Email Address</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPwd ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-dark-500 hover:text-brand-400 transition-colors font-body">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <HiArrowRight /></>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-dark-950 px-4 text-dark-500 text-xs font-heading uppercase tracking-wider">or</span>
            </div>
          </div>

          <button
            onClick={demoLogin}
            disabled={loading}
            className="w-full btn-outline py-3 text-sm"
          >
            Try Demo Account
          </button>

          <p className="text-center text-dark-400 text-sm mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors font-semibold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
