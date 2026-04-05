import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { HiOutlineMail, HiArrowRight } from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'
import toast from 'react-hot-toast'

const API = '/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API}/auth/forgotpassword`, { email })
      setSent(true)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.')
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1486262322051-dfc6cb4cba65?w=1200&q=80)',
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
            <h2 className="font-display text-5xl text-white mb-4">FORGOT<br />PASSWORD?</h2>
            <p className="text-dark-300 text-lg max-w-xs">
              No worries. Enter your email and we'll send you a secure link to reset it.
            </p>
          </div>
          <div className="text-dark-600 text-sm">
            Remembered it? <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
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
            <p className="section-subtitle mb-2">Account Recovery</p>
            <h1 className="font-display text-4xl text-white">RESET<br />PASSWORD</h1>
          </div>

          {sent ? (
            <div className="mt-10 text-center">
              <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiOutlineMail className="text-brand-400 text-3xl" />
              </div>
              <h2 className="font-display text-2xl text-white mb-3">CHECK YOUR EMAIL</h2>
              <p className="text-dark-400 font-body text-sm leading-relaxed mb-6">
                If <span className="text-brand-400">{email}</span> is registered with us, you will receive a password reset link shortly. The link expires in <strong className="text-white">15 minutes</strong>.
              </p>
              <p className="text-dark-500 text-xs font-body">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-brand-400 hover:text-brand-300 transition-colors underline">
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              <p className="text-dark-400 font-body text-sm">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              <div>
                <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Email Address</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <>Send Reset Link <HiArrowRight /></>
                )}
              </button>

              <p className="text-center text-dark-400 text-sm font-body">
                <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                  ← Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
