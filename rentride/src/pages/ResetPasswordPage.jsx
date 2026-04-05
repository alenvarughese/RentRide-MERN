import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { HiOutlineLockClosed, HiArrowRight, HiEye, HiEyeOff } from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'
import toast from 'react-hot-toast'

const API = '/api'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password || form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(`${API}/auth/resetpassword/${token}`, { password: form.password })
      setSuccess(true)
      toast.success('Password reset successfully!')
      // Auto-login the user after 2 seconds
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset link is invalid or has expired.')
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80)',
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
            <h2 className="font-display text-5xl text-white mb-4">CREATE<br />NEW<br />PASSWORD</h2>
            <p className="text-dark-300 text-lg max-w-xs">
              Choose a strong password to keep your account secure.
            </p>
          </div>
          <div className="text-dark-600 text-sm">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">← Back to Sign In</Link>
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
            <h1 className="font-display text-4xl text-white">NEW<br />PASSWORD</h1>
          </div>

          {success ? (
            <div className="mt-10 text-center">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-white mb-3">PASSWORD UPDATED!</h2>
              <p className="text-dark-400 font-body text-sm">
                Your password has been reset successfully. You'll be redirected to your dashboard shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              <p className="text-dark-400 font-body text-sm">
                Enter a new password for your account. Use at least 6 characters.
              </p>

              <div>
                <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">New Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    className="input-field pl-10 pr-10"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                    {showPwd ? <HiEyeOff /> : <HiEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Confirm Password</label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                    className="input-field pl-10"
                  />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-red-400 text-xs mt-1 font-body">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                ) : (
                  <>Set New Password <HiArrowRight /></>
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
