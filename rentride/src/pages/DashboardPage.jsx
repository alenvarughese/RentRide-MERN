import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineUser, HiOutlineBookOpen, HiOutlineCog,
  HiOutlineLogout, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineStar, HiOutlineGift, HiOutlineTag
} from 'react-icons/hi'
import { MdDirectionsCar } from 'react-icons/md'

import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/imageUrl'

const statusConfig = {
  active: { label: 'Active', icon: HiOutlineClock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  completed: { label: 'Completed', icon: HiOutlineCheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  upcoming: { label: 'Upcoming', icon: HiOutlineClock, color: 'text-brand-400 bg-brand-500/10 border-brand-500/30' },
  cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  pending: { label: 'Pending', icon: HiOutlineClock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  confirmed: { label: 'Confirmed', icon: HiOutlineCheckCircle, color: 'text-brand-400 bg-brand-500/10 border-brand-500/30' },
}

const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: HiOutlineBookOpen },
  { id: 'profile', label: 'Profile', icon: HiOutlineUser },
  { id: 'settings', label: 'Settings', icon: HiOutlineCog },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    drivingLicense: user?.drivingLicense || '',
    drivingLicenseImage: user?.drivingLicenseImage || ''
  })

  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('license', file)

    setUploading(true)
    const toastId = toast.loading('Uploading license image...')
    try {
      const { data } = await axios.post('/api/users/upload-license', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfileForm(prev => ({ ...prev, drivingLicenseImage: data.imageUrl }))
      toast.success('File uploaded successfully', { id: toastId })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: toastId })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get('/api/bookings/my')
        setBookings(data.bookings || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch bookings')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchBookings()
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        drivingLicense: user.drivingLicense || '',
        drivingLicenseImage: user.drivingLicenseImage || ''
      })
    }
  }, [user, navigate])

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    try {
      await axios.patch(`/api/bookings/${id}/cancel`)
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b))
      toast.success('Booking cancelled successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/api/users/profile', profileForm)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  }

  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus)

  const stats = [
    { label: 'Total Trips', value: bookings.length },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
    { label: 'RidePoints', value: user?.loyaltyPoints || 0 },
    { label: 'Total Spent', value: `₹${bookings.filter(b => b.status === 'completed').reduce((a, b) => a + (b.totalAmount || 0), 0).toLocaleString()}` },
  ]

  const [reviewModal, setReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/reviews', {
        bookingId: selectedBooking._id,
        vehicleId: selectedBooking.vehicle._id,
        ...reviewForm
      })
      toast.success('Review submitted! Thank you.')
      setReviewModal(false)
      setReviewForm({ rating: 5, comment: '' })
      // Optionally refresh bookings to hide review button if needed
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  }

  const handleDownloadInvoice = async (bookingId, bookingNumber) => {
    const loadingToast = toast.loading('Generating invoice...')
    try {
      const { data } = await axios.get(`/api/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice-${bookingNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Invoice downloaded', { id: loadingToast })
    } catch (err) {
      toast.error('Failed to download invoice', { id: loadingToast })
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-brand-500 flex items-center justify-center text-white font-display text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-4xl text-white">{user?.name?.toUpperCase()}</h1>
              <p className="text-dark-400 font-body text-sm">{user?.email} • Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2025'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-900 border border-dark-800 overflow-hidden">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left border-b border-dark-800 last:border-0 transition-colors font-heading text-sm tracking-wider uppercase ${
                    activeTab === tab.id
                      ? 'bg-brand-500/10 text-brand-400 border-l-2 border-l-brand-500'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <tab.icon className="text-lg" /> {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-dark-800 transition-colors font-heading text-sm tracking-wider uppercase"
              >
                <HiOutlineLogout className="text-lg" /> Logout
              </button>
            </div>

            {/* Stats */}
            <div className="bg-dark-900 border border-dark-800 p-5 mt-4">
              <h4 className="font-heading text-xs uppercase tracking-widest text-dark-400 mb-4">Stats</h4>
              <div className="space-y-3">
                {stats.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center">
                    <span className="text-dark-400 text-sm font-body">{stat.label}</span>
                    <span className="font-heading font-semibold text-brand-400 text-sm">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Box */}
            <div className="bg-brand-500 p-5 mt-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <HiOutlineGift className="text-xl" />
                <h4 className="font-heading text-xs uppercase tracking-widest">Refer & Earn</h4>
              </div>
              <p className="text-[10px] opacity-90 mb-4 uppercase tracking-wider leading-relaxed">
                Share your code & get 500 bonus points on their first trip!
              </p>
              <div className="bg-white/10 border border-white/20 p-3 flex items-center justify-between">
                <span className="font-heading font-bold tracking-widest text-sm">{user?.referralCode || 'RIDE-' + user?._id?.slice(-6).toUpperCase()}</span>
                <button 
                  onClick={() => {
                    const code = user?.referralCode || 'RIDE-' + user?._id?.slice(-6).toUpperCase()
                    navigator.clipboard.writeText(code)
                    toast.success('Referral code copied!')
                  }}
                  className="text-[10px] uppercase font-bold hover:underline"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-3xl text-white">MY BOOKINGS</h2>
                  <div className="flex gap-2">
                    {['all', 'active', 'upcoming', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1 text-xs font-heading tracking-wider uppercase border transition-colors ${
                          filterStatus === status
                            ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                            : 'border-dark-700 text-dark-400 hover:border-dark-500'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-dark-900 border border-dark-800">
                      <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
                      <p className="text-dark-400 font-heading tracking-widest uppercase text-xs">Loading bookings...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-dark-900 border border-dark-800 text-center px-6">
                      <HiOutlineXCircle className="text-5xl text-red-500 mb-4" />
                      <p className="font-display text-2xl text-white mb-2">Error Loading Bookings</p>
                      <p className="text-dark-400 text-sm mb-6">{error}</p>
                      <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
                    </div>
                  ) : filteredBookings.map(booking => {
                    const sc = statusConfig[booking.status] || statusConfig.upcoming
                    const vehicle = booking.vehicle || {}
                    return (
                      <div key={booking._id} className="bg-dark-900 border border-dark-800 hover:border-dark-700 transition-colors overflow-hidden">
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-40 h-32 sm:h-auto overflow-hidden flex-shrink-0">
                            <img src={getImageUrl(vehicle.images?.[0])} alt={vehicle.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 p-5 flex flex-col sm:flex-row items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-heading font-semibold text-white">{vehicle.name}</h3>
                                <span className={`badge border ${sc.color}`}>
                                  <sc.icon className="text-xs" /> {sc.label}
                                </span>
                              </div>
                              <p className="text-dark-400 text-xs mb-3 font-body">{vehicle.location} • {vehicle.type}</p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <div>
                                  <div className="text-dark-500 text-xs font-heading uppercase tracking-wider">Pickup</div>
                                  <div className="text-dark-200 font-body">{new Date(booking.pickupDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-dark-500 text-xs font-heading uppercase tracking-wider">Return</div>
                                  <div className="text-dark-200 font-body">{new Date(booking.returnDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-dark-500 text-xs font-heading uppercase tracking-wider">Duration</div>
                                  <div className="text-dark-200 font-body">{booking.days} days</div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-display text-2xl text-brand-400 mb-1">₹{booking.totalAmount.toLocaleString()}</div>
                              <div className="text-dark-500 text-xs font-body mb-3">#{booking.bookingId}</div>
                              {['pending', 'confirmed'].includes(booking.status) && (
                                <button 
                                  onClick={() => handleCancelBooking(booking._id)}
                                  className="text-red-400 border border-red-400/30 px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-red-400/10 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                              {booking.status === 'completed' && (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDownloadInvoice(booking._id, booking.bookingId)}
                                    className="text-white bg-dark-800 border border-dark-700 px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-dark-700 transition-colors"
                                  >
                                    Invoice
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setSelectedBooking(booking)
                                      setReviewModal(true)
                                    }}
                                    className="text-white bg-brand-500 px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brand-600 transition-colors"
                                  >
                                    Rate Trip
                                  </button>
                                  <Link to={`/vehicles/${vehicle._id}`} className="inline-block text-brand-400 border border-brand-500/30 px-4 py-1.5 text-xs font-heading uppercase tracking-wider hover:bg-brand-500/10 transition-colors">
                                    Re-book
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {!loading && !error && filteredBookings.length === 0 && (
                    <div className="text-center py-20 bg-dark-900 border border-dark-800">
                      <MdDirectionsCar className="text-5xl text-dark-600 mx-auto mb-4" />
                      <p className="font-display text-2xl text-white mb-2">NO {filterStatus.toUpperCase()} BOOKINGS</p>
                      <p className="text-dark-400 text-sm mb-6">Start exploring our fleet and book your first ride.</p>
                      <Link to="/vehicles" className="btn-primary">Browse Vehicles</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="bg-dark-900 border border-dark-800 p-8">
                <h2 className="font-display text-3xl text-white mb-8">MY PROFILE</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Full Name</label>
                    <input disabled value={profileForm.name} className="input-field opacity-60 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Email Address</label>
                    <input disabled value={profileForm.email} className="input-field opacity-60 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Phone Number</label>
                    <input 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      type="tel" 
                      className="input-field" 
                      placeholder="Add phone number" 
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Address</label>
                    <input 
                      value={profileForm.address} 
                      onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                      type="text" 
                      className="input-field" 
                      placeholder="Add your address" 
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Driving License #</label>
                    <input 
                      value={profileForm.drivingLicense} 
                      onChange={(e) => setProfileForm(p => ({ ...p, drivingLicense: e.target.value }))}
                      type="text" 
                      className="input-field" 
                      placeholder="License number" 
                    />
                  </div>
                  <div>
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">License Document</label>
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="bg-dark-800 border border-dark-700 text-white text-xs py-3 px-6 font-heading tracking-widest uppercase hover:border-brand-500 transition-all flex items-center gap-2"
                      >
                        {uploading ? (
                          <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                        ) : profileForm.drivingLicenseImage ? 'Change Image' : 'Select Image'}
                      </button>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      {profileForm.drivingLicenseImage && (
                        <div className="flex items-center gap-2 text-emerald-400 text-[10px] uppercase font-heading tracking-widest">
                          <HiOutlineCheckCircle /> Image Loaded
                        </div>
                      )}
                    </div>
                    <p className="text-dark-500 text-[10px] mt-2 uppercase tracking-wider">Required for renting vehicles • JPG/PNG up to 5MB</p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-dark-800 border border-dark-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-heading text-sm text-white uppercase tracking-widest mb-1">Verification Status</h4>
                      <p className="text-dark-400 text-xs font-body">Your identity must be verified by our admin before booking.</p>
                    </div>
                    <div>
                      {user?.isVerified === 'verified' ? (
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-2 border border-emerald-400/20 font-heading text-xs tracking-widest uppercase">
                          <HiOutlineCheckCircle /> Verified
                        </div>
                      ) : user?.isVerified === 'pending' ? (
                        <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 px-4 py-2 border border-amber-400/20 font-heading text-xs tracking-widest uppercase">
                          <HiOutlineClock /> Pending Review
                        </div>
                      ) : user?.isVerified === 'rejected' ? (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 border border-red-400/20 font-heading text-xs tracking-widest uppercase">
                          <HiOutlineXCircle /> Rejected
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-dark-400 bg-dark-700 px-4 py-2 border border-dark-600 font-heading text-xs tracking-widest uppercase">
                          Unverified
                        </div>
                      )}
                    </div>
                  </div>
                  {profileForm.drivingLicenseImage && (
                    <div className="mt-4 border border-dark-700 p-2 w-40 h-24 overflow-hidden bg-dark-900 flex items-center justify-center">
                      <img 
                        src={getImageUrl(profileForm.drivingLicenseImage)} 
                        alt="License" 
                        className="w-full h-full object-contain" 
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-dark-700 flex justify-between items-center">
                  <p className="text-dark-500 text-xs font-body">Account role: <span className="text-brand-400 uppercase tracking-widest">{user?.role}</span></p>
                  <button type="submit" className="btn-primary">Save & Submit for Verification</button>
                </div>
              </form>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-dark-900 border border-dark-800 p-8">
                <h2 className="font-display text-3xl text-white mb-8">SETTINGS</h2>
                <div className="space-y-6">
                  {[
                    { title: 'Email Notifications', desc: 'Booking confirmations, reminders, and offers', enabled: true },
                    { title: 'SMS Alerts', desc: 'Real-time booking status updates via SMS', enabled: true },
                    { title: 'Promotional Emails', desc: 'Deals, discounts, and fleet updates', enabled: false },
                    { title: 'Two-Factor Authentication', desc: 'Extra security for your account', enabled: false },
                  ].map(setting => (
                    <div key={setting.title} className="flex items-center justify-between py-4 border-b border-dark-800 last:border-0">
                      <div>
                        <div className="font-heading font-semibold text-white text-sm tracking-wide">{setting.title}</div>
                        <div className="text-dark-400 text-xs mt-0.5">{setting.desc}</div>
                      </div>
                      <div className={`w-12 h-6 relative cursor-pointer transition-colors ${setting.enabled ? 'bg-brand-500' : 'bg-dark-700'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white transition-transform ${setting.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-dark-700">
                  <h3 className="font-heading font-semibold text-red-400 text-sm tracking-widest uppercase mb-4">Danger Zone</h3>
                  <button className="border border-red-500/30 text-red-400 font-heading text-sm tracking-wider uppercase px-6 py-2 hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-brand-500/30 w-full max-w-md p-8 relative">
            <button 
              onClick={() => setReviewModal(false)}
              className="absolute top-4 right-4 text-dark-500 hover:text-white"
            >
              ✕
            </button>
            <h3 className="font-display text-2xl text-white mb-2 uppercase italic">Rate Your Experience</h3>
            <p className="text-dark-400 text-sm mb-6 font-body">Trip with {selectedBooking?.vehicle?.name}</p>
            
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-3 block text-center">Your Rating</label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewForm(p => ({ ...p, rating: num }))}
                      className={`w-12 h-12 flex items-center justify-center text-xl transition-all ${
                        reviewForm.rating >= num ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-500'
                      }`}
                    >
                      <HiOutlineStar />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Comment</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  placeholder="Tell us about your ride..."
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" className="w-full btn-primary py-4">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
