import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  HiOutlineStar, HiOutlineLocationMarker, HiOutlineUsers, HiOutlineCheckCircle,
  HiArrowLeft, HiArrowRight, HiOutlineShieldCheck, HiOutlineClock, HiOutlineCalendar
} from 'react-icons/hi'
import { MdElectricBolt } from 'react-icons/md'
import { mockVehicles } from '../utils/mockData'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/imageUrl'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeImage, setActiveImage] = useState(0)

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [related, setRelated] = useState([])
  const [busyDates, setBusyDates] = useState([])

  useEffect(() => {
    const fetchBusyDates = async () => {
      try {
        const { data } = await axios.get(`/api/vehicles/${id}/busy-dates`)
        if (data.success) {
          setBusyDates(data.busyDates)
        }
      } catch (err) {
        console.error('Failed to fetch busy dates')
      }
    }
    fetchBusyDates()
  }, [id])

  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/reviews/vehicle/${id}`)
        if (data.success) setReviews(data.reviews)
      } catch (err) {
        console.error('Failed to fetch reviews')
      }
    }
    fetchReviews()
  }, [id])

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/vehicles/${id}`)
        setVehicle(data.vehicle)
        
        // Fetch related vehicles
        const { data: allVehicles } = await axios.get('/api/vehicles')
        const filtered = (allVehicles.vehicles || [])
          .filter(v => v.type === data.vehicle.type && v._id !== data.vehicle._id)
          .slice(0, 3)
        setRelated(filtered)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch vehicle details')
      } finally {
        setLoading(false)
      }
    }
    fetchVehicle()
  }, [id])

  const handleBook = () => {
    if (!user) {
      toast.error('Please login to book a vehicle')
      navigate(`/login?redirect=/vehicles/${id}`)
      return
    }
    navigate(`/booking/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
          <p className="text-dark-400 font-heading tracking-widest uppercase text-sm">Loading Vehicle Details...</p>
        </div>
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="text-6xl mb-4">{error ? '⚠️' : '🚗'}</div>
          <h2 className="font-display text-4xl text-white mb-4">{error || 'Vehicle Not Found'}</h2>
          <Link to="/vehicles" className="btn-primary">Browse Fleet</Link>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      {/* Breadcrumb */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm">
          <Link to="/vehicles" className="text-dark-400 hover:text-brand-400 flex items-center gap-1 transition-colors font-heading tracking-wider uppercase text-xs">
            <HiArrowLeft /> Fleet
          </Link>
          <span className="text-dark-700">/</span>
          <span className="text-dark-300 font-heading text-xs uppercase tracking-wider">{vehicle.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Images + Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div>
              <div className="relative aspect-[16/9] overflow-hidden bg-dark-800">
                <img
                  src={getImageUrl(vehicle.images[activeImage])}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 to-transparent" />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="font-heading text-xs tracking-widest uppercase bg-dark-950/80 backdrop-blur-sm text-brand-400 px-3 py-1 border border-brand-500/30">
                    {vehicle.type}
                  </span>
                  {vehicle.fuelType === 'Electric' && (
                    <span className="font-heading text-xs tracking-widest uppercase bg-emerald-900/80 text-emerald-400 px-3 py-1 border border-emerald-500/30 flex items-center gap-1">
                      <MdElectricBolt /> Electric
                    </span>
                  )}
                </div>
                {!vehicle.available && (
                  <div className="absolute inset-0 bg-dark-950/60 flex items-center justify-center">
                    <span className="font-display text-4xl text-red-400 tracking-widest">UNAVAILABLE</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-none">
                  {vehicle.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-[4/3] w-24 flex-shrink-0 overflow-hidden border-2 transition-all duration-300 ${activeImage === i ? 'border-brand-500 scale-95' : 'border-dark-700 hover:border-dark-500 opacity-60 hover:opacity-100'}`}
                    >
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-4xl md:text-5xl text-white tracking-wide mb-1">{vehicle.name}</h1>
                  <p className="text-dark-400 font-body">{vehicle.brand} {vehicle.model} • {vehicle.year} • {vehicle.color}</p>
                </div>
                <div className="flex items-center gap-2 bg-dark-800 border border-dark-700 px-4 py-2">
                  <HiOutlineStar className="text-brand-400" />
                  <span className="font-heading text-white font-semibold">{vehicle.rating}</span>
                  <span className="text-dark-500 text-sm">({vehicle.reviewCount})</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 text-dark-300 text-sm">
                  <HiOutlineLocationMarker className="text-brand-500" /> {vehicle.location}
                </div>
                <div className="flex items-center gap-2 text-dark-300 text-sm">
                  <HiOutlineUsers className="text-brand-500" /> {vehicle.seats} seats
                </div>
                <span className="text-dark-300 text-sm font-heading uppercase tracking-wider bg-dark-800 px-3 py-1 border border-dark-700">
                  {vehicle.transmission}
                </span>
                <span className="text-dark-300 text-sm font-heading uppercase tracking-wider bg-dark-800 px-3 py-1 border border-dark-700">
                  {vehicle.fuelType}
                </span>
                {vehicle.mileageLimit && (
                  <span className="text-dark-300 text-sm font-heading uppercase tracking-wider bg-dark-800 px-3 py-1 border border-dark-700">
                    {vehicle.mileageLimit}km/day limit
                  </span>
                )}
              </div>

              <p className="text-dark-300 leading-relaxed mb-6">{vehicle.description}</p>

              {/* Features */}
              <div>
                <h3 className="font-heading font-semibold text-white tracking-widest uppercase text-sm mb-4">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map(f => (
                    <div key={f} className="flex items-center gap-2 bg-dark-800 border border-dark-700 px-4 py-2 text-dark-300 text-sm">
                      <HiOutlineCheckCircle className="text-brand-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: HiOutlineShieldCheck, title: 'Insurance', desc: 'Comprehensive coverage included in all rentals.' },
                { icon: HiOutlineClock, title: '24/7 Support', desc: 'Roadside assistance available at any hour.' },
              ].map(item => (
                <div key={item.title} className="bg-dark-900 border border-dark-800 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-brand-400 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-white text-sm tracking-wide mb-1">{item.title}</h4>
                    <p className="text-dark-400 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-dark-900 border border-dark-700 p-6 sticky top-24">
              <div className="border-b border-dark-700 pb-5 mb-5">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-display text-4xl text-brand-400">₹{vehicle.pricePerDay.toLocaleString()}</span>
                  <span className="text-dark-400 font-body text-sm">/ day</span>
                </div>
                <p className="text-dark-500 text-xs font-body">₹{vehicle.pricePerHour}/hour • Minimum 4 hours</p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  ['Pickup / Drop-off', vehicle.location],
                  ['Min. Booking', '4 hours'],
                  ['Cancellation', 'Free up to 24hrs before'],
                  ['Security Deposit', '₹5,000 (refundable)'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-dark-400 font-body">{label}</span>
                    <span className="text-dark-200 font-heading tracking-wide">{value}</span>
                  </div>
                ))}
              </div>

              {vehicle.available ? (
                <div className="space-y-4">
                  <button onClick={handleBook} className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                    Book Now <HiArrowRight />
                  </button>
                  
                  {busyDates.length > 0 && (
                    <div className="pt-4 border-t border-dark-700">
                      <h4 className="font-heading text-[10px] tracking-[0.2em] uppercase text-dark-500 mb-3">Currently Booked Dates</h4>
                      <div className="space-y-2">
                        {busyDates.map((range, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-orange-400 bg-orange-400/5 border border-orange-400/10 p-2">
                            <HiOutlineCalendar className="flex-shrink-0" />
                            <span>
                              {new Date(range.start).toLocaleDateString()} — {new Date(range.end).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button disabled className="w-full bg-dark-700 text-dark-500 font-heading font-semibold tracking-widest uppercase py-4 cursor-not-allowed">
                  Currently Unavailable
                </button>
              )}

              <p className="text-dark-500 text-xs text-center mt-3 font-body">No charge until booking is confirmed</p>
            </div>
          </div>
        </div>

        {/* Related Vehicles */}
        {related.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl text-white">SIMILAR VEHICLES</h2>
              <Link to={`/vehicles?type=${vehicle.type}`} className="btn-ghost flex items-center gap-1 text-sm">
                View All <HiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map(v => (
                <Link key={v._id} to={`/vehicles/${v._id}`}>
                  <div className="card-hover overflow-hidden group">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={getImageUrl(v.images[0])} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <div className="font-heading font-semibold text-white text-sm mb-1 group-hover:text-brand-400 transition-colors">{v.name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-dark-400 text-xs">{v.location}</span>
                        <span className="font-display text-lg text-brand-400">₹{v.pricePerDay.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Reviews Section */}
        <div className="mt-20 pt-10 border-t border-dark-800">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-4xl text-white mb-2 uppercase italic tracking-tight">EXPERIENCE REPORTS</h2>
              <p className="text-dark-400 text-sm font-body">Feedback from our verified members</p>
            </div>
            {vehicle.reviewCount > 0 && (
              <div className="text-right">
                <div className="font-display text-5xl text-brand-400">{vehicle.rating}</div>
                <div className="flex gap-1 justify-end text-brand-500 my-1">
                  {[...Array(5)].map((_, i) => (
                    <HiOutlineStar key={i} className={i < Math.round(vehicle.rating) ? 'fill-current' : 'opacity-20'} />
                  ))}
                </div>
                <div className="text-dark-500 text-[10px] uppercase tracking-widest font-heading">{vehicle.reviewCount} Reviews</div>
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review._id} className="bg-dark-900 border border-dark-800 p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-heading font-semibold text-white uppercase tracking-wider text-sm">{review.user?.name}</div>
                      <div className="text-dark-500 text-[10px] uppercase tracking-widest mt-1">Verified Renter • {new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-1 text-brand-400">
                      {[...Array(review.rating)].map((_, i) => <HiOutlineStar key={i} className="fill-current" />)}
                    </div>
                  </div>
                  <p className="text-dark-300 italic font-body text-sm leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-900 border border-dark-800 p-12 text-center">
              <div className="text-4xl mb-4">⭐</div>
              <p className="text-dark-400 font-heading text-xs tracking-[0.25em] uppercase">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
