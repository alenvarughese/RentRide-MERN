import { useState } from 'react'
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineClock, HiArrowRight } from 'react-icons/hi'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    toast.success('Message sent! We\'ll get back to you within 24 hours.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      {/* Header */}
      <div className="bg-dark-900 border-b border-dark-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-subtitle mb-3">We're Here</p>
          <h1 className="font-display text-7xl text-white">GET IN<br /><span className="text-brand-500">TOUCH</span></h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-heading font-semibold text-white tracking-widest uppercase mb-6 text-sm">Contact Info</h2>
              <div className="space-y-5">
                {[
                  { icon: HiOutlinePhone, label: 'Phone', value: '+91 12345 67890', sub: 'Mon–Sat, 8am–8pm' },
                  { icon: HiOutlineMail, label: 'Email', value: 'hello@rentride.in', sub: 'We reply within 24hrs' },
                  { icon: HiOutlineLocationMarker, label: 'Address', value: '123 Fleet Street, Mumbai', sub: 'Maharashtra, India 400001' },
                  { icon: HiOutlineClock, label: 'Support Hours', value: '24/7 Emergency Line', sub: 'Mon–Sat: 8am–8pm regular' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-brand-400" />
                    </div>
                    <div>
                      <div className="font-heading text-xs uppercase tracking-widest text-dark-500 mb-0.5">{item.label}</div>
                      <div className="text-white text-sm font-body">{item.value}</div>
                      <div className="text-dark-500 text-xs">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ links */}
            <div className="bg-dark-900 border border-dark-800 p-6">
              <h3 className="font-heading text-xs uppercase tracking-widest text-dark-400 mb-4">Quick Help</h3>
              <div className="space-y-2">
                {['How to cancel a booking?', 'Refund policy', 'Driving license requirements', 'Insurance coverage details'].map(q => (
                  <button key={q} className="w-full text-left text-dark-300 hover:text-brand-400 text-sm transition-colors flex items-center gap-2 py-1 group font-body">
                    <span className="text-dark-700 group-hover:text-brand-500 transition-colors">→</span> {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-dark-900 border border-dark-800 p-8">
              <h2 className="font-display text-3xl text-white mb-8">SEND A MESSAGE</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Email *</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      required
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Subject *</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    required
                    className="input-field cursor-pointer"
                  >
                    <option value="">Select a subject</option>
                    <option>Booking Enquiry</option>
                    <option>Cancellation Request</option>
                    <option>Vehicle Issue</option>
                    <option>Payment Problem</option>
                    <option>Partnership</option>
                    <option>General Query</option>
                  </select>
                </div>
                <div>
                  <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Message *</label>
                  <textarea
                    rows={6}
                    placeholder="Describe your query in detail..."
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    required
                    className="input-field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 py-4"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <>Send Message <HiArrowRight /></>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
