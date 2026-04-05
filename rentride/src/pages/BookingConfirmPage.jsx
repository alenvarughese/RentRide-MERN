import { Link, useParams } from 'react-router-dom'
import { HiOutlineCheckCircle, HiOutlineDownload, HiOutlineHome } from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function BookingConfirmPage() {
  const { bookingId } = useParams()

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice-${bookingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Failed to download receipt')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto animate-pulse-glow">
            <HiOutlineCheckCircle className="text-emerald-400 text-5xl" />
          </div>
        </div>

        <p className="section-subtitle mb-3">Booking Confirmed</p>
        <h1 className="font-display text-6xl text-white mb-4">YOU'RE ALL SET!</h1>
        <p className="text-dark-300 mb-2">
          Your booking has been confirmed. A confirmation email has been sent to your registered email address.
        </p>
        <div className="inline-flex items-center gap-2 bg-dark-800 border border-dark-700 px-6 py-3 my-6">
          <span className="text-dark-400 text-sm font-body">Booking ID:</span>
          <span className="font-heading font-bold text-brand-400 tracking-widest">{bookingId}</span>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '📍', title: 'Pickup Location', desc: 'Check your email for exact address' },
            { icon: '🕘', title: 'Pickup Time', desc: 'As per your booking schedule' },
            { icon: '📞', title: 'Support', desc: '+91 12345 67890 (24/7)' },
            { icon: '🛡️', title: 'Insurance', desc: 'Comprehensive coverage active' },
          ].map(item => (
            <div key={item.title} className="bg-dark-900 border border-dark-800 p-4 text-left">
              <div className="text-xl mb-2">{item.icon}</div>
              <div className="font-heading text-white text-xs uppercase tracking-wider mb-1">{item.title}</div>
              <div className="text-dark-400 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard" className="btn-primary flex items-center justify-center gap-2">
            <MdDirectionsCar /> View My Bookings
          </Link>
          <Link to="/" className="btn-outline flex items-center justify-center gap-2">
            <HiOutlineHome /> Back to Home
          </Link>
        </div>

        <button 
          onClick={handleDownload}
          className="mt-4 text-dark-400 hover:text-brand-400 text-sm flex items-center gap-2 mx-auto transition-colors font-heading tracking-wider uppercase"
        >
          <HiOutlineDownload /> Download Receipt
        </button>
      </div>
    </div>
  )
}
