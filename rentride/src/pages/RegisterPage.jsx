import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiArrowRight, HiEye, HiEyeOff, HiOutlineTag } from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', agreeTerms: false, referredBy: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Comprehensive Validation
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error('Please fill in all required fields')
      return
    }

    const emailRegex = /^\w+([\.-]?\w+)*@gmail\.com$/
    if (!emailRegex.test(form.email)) {
      toast.error('Only Gmail addresses are allowed')
      return
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!form.agreeTerms) {
      toast.error('Please accept the terms and conditions')
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, referredBy: form.referredBy })
      toast.success('Account created! Welcome to RentRide.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark-900">
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1611936700950-20be2d2dc2a5?w=1200&q=80)',
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
            <h2 className="font-display text-6xl text-white mb-4">START YOUR<br />JOURNEY</h2>
            <p className="text-dark-300 text-lg max-w-xs">
              Join thousands of adventurers who trust RentRide for every trip.
            </p>
            <div className="mt-8 space-y-3">
              {[
                'Access 1,200+ vehicles across India',
                'Instant booking & confirmation',
                'Fully insured every ride',
                '24/7 roadside support',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-dark-300 text-sm">
                  <div className="w-5 h-5 bg-brand-500/20 border border-brand-500/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-brand-400 text-xs">✓</span>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-dark-600 text-xs font-body">© 2025 RentRide. All rights reserved.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="mb-3">
            <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-brand-500 flex items-center justify-center">
                <MdDirectionsCar className="text-white text-lg" />
              </div>
              <span className="font-display text-xl text-white tracking-widest">RENT<span className="text-brand-500">RIDE</span></span>
            </Link>
            <p className="section-subtitle mb-2">New Account</p>
            <h1 className="font-display text-4xl text-white">CREATE ACCOUNT</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-8">
            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Full Name *</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Email Address *</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input type="email" placeholder="example@gmail.com" value={form.email} onChange={set('email')} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Phone Number *</label>
              <div className="relative">
                <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input type="tel" placeholder="+91 99999 00000" value={form.phone} onChange={set('phone')} className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Password *</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set('password')}
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPwd ? <HiEyeOff /> : <HiEye />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Referral Code (Optional)</label>
              <div className="relative">
                <HiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="text"
                  placeholder="e.g. RIDE-XXXXXX"
                  value={form.referredBy}
                  onChange={set('referredBy')}
                  className="input-field pl-10 uppercase font-heading tracking-widest"
                />
              </div>
            </div>

            <div>
              <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Confirm Password *</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group mt-2">
              <div className={`w-5 h-5 border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${form.agreeTerms ? 'border-brand-500 bg-brand-500' : 'border-dark-600 group-hover:border-dark-400'}`}>
                {form.agreeTerms && <span className="text-white text-xs">✓</span>}
              </div>
              <input type="checkbox" checked={form.agreeTerms} onChange={set('agreeTerms')} className="sr-only" />
              <span className="text-dark-400 text-sm font-body">
                I agree to the{' '}
                <Link to="/terms" className="text-brand-400 hover:text-brand-300 transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-brand-400 hover:text-brand-300 transition-colors">Privacy Policy</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <HiArrowRight /></>
              )}
            </button>
          </form>

          <p className="text-center text-dark-400 text-sm mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
