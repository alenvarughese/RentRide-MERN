import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { HiArrowLeft, HiArrowRight, HiOutlineCalendar, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineDownload } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import DatePicker from 'react-datepicker'
import { getImageUrl } from '../utils/imageUrl'
import "react-datepicker/dist/react-datepicker.css"
import { isWithinInterval, addDays, format, parseISO } from 'date-fns'

const addons = [
  { id: 'gps', label: 'GPS Navigation', price: 199, icon: '🗺️' },
  { id: 'insurance_plus', label: 'Premium Insurance', price: 499, icon: '🛡️' },
  { id: 'driver', label: 'Personal Driver', price: 1499, icon: '👤' },
  { id: 'child_seat', label: 'Child Seat', price: 149, icon: '🪑' },
  { id: 'helmet', label: 'Helmet (2x)', price: 99, icon: '🪖' },
  { id: 'carrier', label: 'Luggage Carrier', price: 249, icon: '🧳' },
]

export default function BookingPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  const [form, setForm] = useState({
    pickupDate: today,
    returnDate: tomorrow,
    pickupTime: '09:00',
    returnTime: '09:00',
    selectedAddons: [],
    notes: '',
    paymentMethod: 'card',
    usePoints: 0,
  })

  const [step, setStep] = useState(1)
  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [busyDates, setBusyDates] = useState([])

  useEffect(() => {
    const fetchBusyDates = async () => {
      try {
        const { data } = await axios.get(`/api/vehicles/${id}/busy-dates`)
        if (data.success) {
          setBusyDates(data.busyDates.map(range => ({
            start: parseISO(range.start),
            end: parseISO(range.end)
          })))
        }
      } catch (err) {
        console.error('Failed to fetch busy dates')
      }
    }
    fetchBusyDates()
  }, [id])

  const calculateDays = () => {
    try {
      const start = new Date(`${form.pickupDate}T${form.pickupTime}`)
      const end = new Date(`${form.returnDate}T${form.returnTime}`)
      const diffInMs = end - start
      if (diffInMs <= 0) return 1
      const diffInHours = diffInMs / (1000 * 60 * 60)
      return Math.max(1, Math.ceil(diffInHours / 24))
    } catch (e) {
      return 1
    }
  }

  const days = calculateDays()

  const addonTotal = form.selectedAddons.reduce((acc, aid) => {
    const addon = addons.find(a => a.id === aid)
    return acc + (addon ? addon.price * days : 0)
  }, 0)

  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [validCoupon, setValidCoupon] = useState(null)

  const handleApplyCoupon = async () => {
    try {
      const { data } = await axios.post('/api/coupons/validate', {
        code: couponCode,
        amount: vehicleCost + addonTotal + taxes
      })
      if (data.success) {
        setDiscount(data.discount)
        setValidCoupon(data.code)
        toast.success(data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid promo code')
      setDiscount(0)
      setValidCoupon(null)
    }
  }

  const vehicleCost = (vehicle?.pricePerDay || 0) * days
  const taxes = Math.round((vehicleCost + addonTotal) * 0.18)
  const deposit = 5000
  const total = Math.max(0, (vehicleCost + addonTotal + taxes + deposit) - discount - form.usePoints)

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const { data } = await axios.get(`/api/vehicles/${id}`)
        setVehicle(data.vehicle)
      } catch (err) {
        toast.error('Failed to load vehicle details')
      } finally {
        setFetchLoading(false)
      }
    }
    fetchVehicle()
  }, [id])

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/payments/create-checkout-session', {
        ...form,
        vehicleId: id,
        vehicleName: vehicle.name,
        days,
        vehicleCost,
        addonCost: addonTotal,
        taxes,
        deposit,
        discount,
        promoCode: validCoupon,
        totalAmount: total,
        usePoints: form.usePoints
      })
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize checkout.')
    } finally {
      setLoading(false)
    }
  }

  const toggleAddon = (id) => {
    setForm(prev => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(id)
        ? prev.selectedAddons.filter(a => a !== id)
        : [...prev.selectedAddons, id]
    }))
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
          <p className="text-dark-400 font-heading tracking-widest uppercase text-sm">Loading Booking Details...</p>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <h2 className="font-display text-4xl text-white mb-4">Vehicle Not Found</h2>
          <Link to="/vehicles" className="btn-primary">Browse Fleet</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={`/vehicles/${id}`} className="text-dark-400 hover:text-brand-400 flex items-center gap-1 text-sm transition-colors font-heading tracking-wider uppercase">
            <HiArrowLeft /> Back to Vehicle
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <p className="section-subtitle mb-2">Secure Booking</p>
          <h1 className="font-display text-5xl text-white">BOOK YOUR RIDE</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-10">
          {['Select Dates', 'Add-ons', 'Confirm & Pay'].map((label, i) => {
            const stepNum = i + 1
            return (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 flex items-center justify-center font-display text-sm transition-colors ${step >= stepNum ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-500 border border-dark-700'}`}>
                  {step > stepNum ? <HiOutlineCheckCircle /> : stepNum}
                </div>
                <span className={`font-heading text-xs tracking-widest uppercase hidden sm:block ${step >= stepNum ? 'text-white' : 'text-dark-500'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-px w-8 md:w-16 ${step > stepNum ? 'bg-brand-500' : 'bg-dark-700'}`} />}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">

            {/* Step 1: Dates */}
            {step === 1 && (
              <div className="bg-dark-900 border border-dark-800 p-8 space-y-6">
                <h2 className="font-heading font-semibold text-white tracking-widest uppercase flex items-center gap-2">
                  <HiOutlineCalendar className="text-brand-500" /> Select Your Dates
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 block">Pickup Date</label>
                    <DatePicker
                      selected={new Date(form.pickupDate)}
                      onChange={date => setForm(p => ({ ...p, pickupDate: date.toISOString().split('T')[0] }))}
                      minDate={new Date()}
                      excludeDateIntervals={busyDates}
                      className="input-field w-full"
                      placeholderText="Select pickup date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 block">Return Date</label>
                    <DatePicker
                      selected={new Date(form.returnDate)}
                      onChange={date => setForm(p => ({ ...p, returnDate: date.toISOString().split('T')[0] }))}
                      minDate={new Date(form.pickupDate)}
                      excludeDateIntervals={busyDates}
                      className="input-field w-full"
                      placeholderText="Select return date"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 block">Pickup Time</label>
                    <div className="relative">
                      <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 z-10" />
                      <DatePicker
                        selected={new Date(`${form.pickupDate}T${form.pickupTime}`)}
                        onChange={date => setForm(p => ({ ...p, pickupTime: format(date, 'HH:mm') }))}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="input-field w-full pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="font-heading text-xs tracking-widest uppercase text-dark-400 block">Return Time</label>
                    <div className="relative">
                      <HiOutlineClock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 z-10" />
                      <DatePicker
                        selected={new Date(`${form.returnDate}T${form.returnTime}`)}
                        onChange={date => setForm(p => ({ ...p, returnTime: format(date, 'HH:mm') }))}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="input-field w-full pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Special Requests / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Any special requirements?"
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex justify-between gap-4 pt-4 border-t border-dark-700">
                  <div className="bg-dark-800 border border-dark-700 px-6 py-3">
                    <div className="font-heading text-xs uppercase tracking-widest text-dark-400 mb-1">Duration</div>
                    <div className="font-display text-2xl text-brand-400">{days} {days === 1 ? 'Day' : 'Days'}</div>
                  </div>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 max-w-xs">
                    Continue to Add-ons →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add-ons */}
            {step === 2 && (
              <div className="bg-dark-900 border border-dark-800 p-8 space-y-6">
                <h2 className="font-heading font-semibold text-white tracking-widest uppercase">Optional Add-ons</h2>
                <p className="text-dark-400 text-sm">Enhance your rental experience. Add-ons are priced per day.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addons.map(addon => {
                    const selected = form.selectedAddons.includes(addon.id)
                    return (
                      <button
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-center gap-4 p-4 border text-left transition-all ${selected ? 'border-brand-500 bg-brand-500/10' : 'border-dark-700 bg-dark-800 hover:border-dark-500'}`}
                      >
                        <span className="text-2xl">{addon.icon}</span>
                        <div className="flex-1">
                          <div className={`font-heading text-sm font-semibold tracking-wide ${selected ? 'text-brand-400' : 'text-white'}`}>{addon.label}</div>
                          <div className="text-dark-400 text-xs">₹{addon.price}/day</div>
                        </div>
                        <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${selected ? 'border-brand-500 bg-brand-500' : 'border-dark-600'}`}>
                          {selected && <HiOutlineCheckCircle className="text-white text-xs" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between gap-4 pt-4 border-t border-dark-700">
                  <button onClick={() => setStep(1)} className="btn-outline">← Back</button>
                  <button onClick={() => setStep(3)} className="btn-primary">Review & Pay →</button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-dark-900 border border-dark-800 p-8 space-y-6">
                <h2 className="font-heading font-semibold text-white tracking-widest uppercase">Secure Payment</h2>
                
                <div className="bg-brand-500/10 border border-brand-500/20 p-4 flex items-center gap-4">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="font-heading text-sm text-white font-semibold">Stripe Secure Redirection</div>
                    <p className="text-dark-400 text-xs">You will be redirected to Stripe to safely complete your payment.</p>
                  </div>
                </div>

                <div className="p-6 bg-dark-800 rounded-lg border border-dark-700 space-y-4">
                  {user?.loyaltyPoints > 0 && (
                    <div className="p-4 bg-brand-500/5 border border-brand-500/20 rounded-lg space-y-3">
                      <div className="flex justify-between items-center text-xs font-heading tracking-widest uppercase">
                        <span className="text-dark-400">Available RidePoints</span>
                        <span className="text-brand-400 font-bold">{user.loyaltyPoints} PTS</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          max={user.loyaltyPoints}
                          min={0}
                          value={form.usePoints}
                          onChange={e => setForm(p => ({ ...p, usePoints: Math.min(Number(e.target.value), user.loyaltyPoints) }))}
                          placeholder="Redeem points"
                          className="bg-dark-950 border border-dark-700 text-white px-3 py-2 text-xs outline-none focus:border-brand-500 flex-1"
                        />
                        <button 
                          type="button"
                          onClick={() => setForm(p => ({ ...p, usePoints: Math.min(user.loyaltyPoints, (vehicleCost + addonTotal + taxes + deposit) - discount) }))}
                          className="text-[10px] text-brand-400 font-heading tracking-widest uppercase hover:underline"
                        >
                          Use All
                        </button>
                      </div>
                      <p className="text-[10px] text-dark-500 uppercase tracking-wider italic">1 Point = ₹1 Discount</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-dark-400 text-sm uppercase tracking-wider font-heading">Subtotal</span>
                    <span className="text-xl font-display text-white">₹{(total + discount).toLocaleString()}</span>
                  </div>

                  {/* Promo code moved to sidebar */}

                  <div className="pt-4 border-t border-dark-700 flex justify-between items-center">
                    <span className="text-dark-200 text-sm uppercase tracking-wider font-heading">Total Amount</span>
                    <span className="text-2xl font-display text-brand-400">₹{total.toLocaleString()}</span>
                  </div>
                  <p className="text-dark-500 text-[10px] uppercase tracking-[0.2em]">Includes Taxes, Add-ons & Refundable Deposit</p>
                </div>

                <div className="space-y-4">
                  <button 
                    disabled={user?.isVerified !== 'verified' || loading}
                    onClick={handleCheckout} 
                    className={`btn-primary w-full py-4 flex items-center justify-center gap-2 ${user?.isVerified !== 'verified' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Redirecting to Stripe...' : 'Pay & Confirm Booking'} <HiArrowRight />
                  </button>
                  {user?.isVerified !== 'verified' && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg">
                      <div className="flex items-center gap-2 font-heading text-[10px] tracking-widest uppercase mb-1">
                        <HiOutlineXCircle className="text-sm" /> Verification Required
                      </div>
                      <p className="text-[10px] font-body">In order to rent a vehicle, your identity must be verified. Please upload your driving license in your profile.</p>
                      <Link to="/dashboard" className="text-[10px] underline mt-1 block hover:text-white transition-colors">Go to Profile Dashboard</Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-dark-900 border border-dark-700 p-6 sticky top-24">
              <h3 className="font-heading font-semibold text-white tracking-widest uppercase text-sm mb-4">Booking Summary</h3>

              {/* Vehicle preview */}
              <div className="flex gap-3 mb-5 pb-5 border-b border-dark-700">
                <div className="w-20 h-16 overflow-hidden flex-shrink-0">
                  <img src={getImageUrl(vehicle.images[0])} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-white text-sm">{vehicle.name}</div>
                  <div className="text-dark-400 text-xs mt-0.5">{vehicle.type} • {vehicle.transmission}</div>
                  <div className="text-brand-400 font-heading text-xs mt-1">{vehicle.location}</div>
                </div>
              </div>

              {/* Date summary */}
              <div className="space-y-2 mb-5 pb-5 border-b border-dark-700 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Pickup</span>
                  <span className="text-dark-200 font-body">{form.pickupDate} {form.pickupTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Return</span>
                  <span className="text-dark-200 font-body">{form.returnDate} {form.returnTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Duration</span>
                  <span className="text-brand-400 font-heading">{days} {days === 1 ? 'Day' : 'Days'}</span>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between">
                  <span className="text-dark-400">Vehicle ({days}d × ₹{vehicle.pricePerDay.toLocaleString()})</span>
                  <span className="text-dark-200">₹{vehicleCost.toLocaleString()}</span>
                </div>
                {addonTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-dark-400">Add-ons</span>
                    <span className="text-dark-200">₹{addonTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-dark-400">GST (18%)</span>
                  <span className="text-dark-200">₹{taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Security Deposit</span>
                  <span className="text-dark-200">₹{deposit.toLocaleString()}</span>
                </div>

                <div className="pt-4 border-t border-dark-700 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="bg-dark-950 border border-dark-700 text-white px-3 py-2 text-xs outline-none focus:border-brand-500 flex-1"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="btn-outline px-3 py-2 text-[10px] tracking-widest"
                    >
                      APPLY
                    </button>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-emerald-400 text-xs font-heading">
                      <span>DISCOUNT ({validCoupon})</span>
                      <span>- ₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-dark-700 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-semibold text-white uppercase tracking-wider">Total</span>
                  <span className="font-display text-2xl text-brand-400">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-dark-500 text-xs mt-1">Deposit refundable after safe return</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
