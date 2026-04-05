import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineLocationMarker, HiArrowRight, HiOutlineShieldCheck, HiOutlineClock, HiOutlineThumbUp } from 'react-icons/hi'
import { MdElectricCar } from 'react-icons/md'
import { FaMotorcycle, FaShip, FaTruck } from 'react-icons/fa'
import { mockVehicles, stats, testimonials, vehicleTypes } from '../utils/mockData'
import VehicleCard from '../components/vehicles/VehicleCard'

const featureVehicleTypes = [
  { id: 'car', label: 'Cars', icon: <MdElectricCar />, count: '120+ models', color: 'from-blue-500/20 to-blue-900/5' },
  { id: 'bike', label: 'Bikes', icon: <FaMotorcycle />, count: '80+ models', color: 'from-orange-500/20 to-orange-900/5' },
  { id: 'truck', label: 'Trucks', icon: <FaTruck />, count: '40+ models', color: 'from-yellow-500/20 to-yellow-900/5' },
  { id: 'boat', label: 'Boats', icon: <FaShip />, count: '25+ models', color: 'from-cyan-500/20 to-cyan-900/5' },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (location) params.set('location', location)
    navigate(`/vehicles?${params.toString()}`)
  }

  const featuredVehicles = mockVehicles.filter(v => v.available).slice(0, 4)

  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-950 noise-overlay">
        {/* Background layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20"
            style={{
              background: 'radial-gradient(ellipse at 80% 50%, rgba(249,115,22,0.3) 0%, transparent 70%)'
            }}
          />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 20% 80%, rgba(249,115,22,0.4) 0%, transparent 60%)'
            }}
          />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Diagonal accent bar */}
        <div className="absolute top-0 right-0 w-2 h-full bg-brand-500 opacity-60" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-4xl">
            {/* Tag line */}
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className="h-px w-12 bg-brand-500" />
              <span className="section-subtitle">India's #1 Vehicle Rental Platform</span>
            </div>

            {/* Main heading */}
            <h1 className="font-display text-7xl sm:text-8xl lg:text-[120px] leading-none text-white mb-6 animate-slide-up">
              DRIVE<br />
              <span className="text-brand-500 text-glow">ANY</span>THING
            </h1>
            <p className="font-body text-dark-300 text-lg md:text-xl max-w-xl mb-10 leading-relaxed animate-slide-up">
              Cars, bikes, trucks, boats — our fleet has over 1,000 vehicles across 100+ cities.
              Book in minutes. No hassle. No hidden fees.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="bg-dark-900 border border-dark-700 p-1 flex flex-col sm:flex-row gap-1 max-w-2xl mb-12 animate-fade-in">
              <div className="flex items-center gap-3 flex-1 bg-dark-800 px-4 py-3">
                <HiOutlineSearch className="text-brand-500 text-lg flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-dark-500 outline-none w-full font-body text-sm"
                />
              </div>
              <div className="flex items-center gap-3 flex-1 bg-dark-800 px-4 py-3 border-t sm:border-t-0 sm:border-l border-dark-700">
                <HiOutlineLocationMarker className="text-brand-500 text-lg flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City or location..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="bg-transparent text-white placeholder-dark-500 outline-none w-full font-body text-sm"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 justify-center whitespace-nowrap">
                Search <HiArrowRight />
              </button>
            </form>

            {/* Stats */}
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {stats.map(stat => (
                <div key={stat.label}>
                  <div className="font-display text-3xl text-brand-400">{stat.value}</div>
                  <div className="font-heading text-dark-400 text-xs tracking-widest uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-gradient-to-b from-brand-500 to-transparent animate-pulse" />
          <span className="font-heading text-xs tracking-widest uppercase text-dark-400">Scroll</span>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="section-subtitle mb-3">Fleet Categories</p>
              <h2 className="section-title">EVERY<br />VEHICLE TYPE</h2>
            </div>
            <Link to="/vehicles" className="btn-outline flex items-center gap-2">
              View All <HiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featureVehicleTypes.map(type => (
              <Link
                key={type.id}
                to={`/vehicles?type=${type.id}`}
                className={`group relative bg-gradient-to-br ${type.color} border border-dark-700 hover:border-brand-500 p-8 transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="text-4xl mb-4 text-brand-400 group-hover:scale-110 transition-transform duration-300">
                  {type.icon}
                </div>
                <h3 className="font-display text-2xl text-white tracking-wide mb-1">{type.label}</h3>
                <p className="text-dark-400 text-sm font-body">{type.count}</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <HiArrowRight className="text-brand-500 text-xl" />
                </div>
              </Link>
            ))}
          </div>

          {/* All type pills */}
          <div className="flex flex-wrap gap-3 mt-8">
            {vehicleTypes.slice(1).map(type => (
              <Link
                key={type.id}
                to={`/vehicles?type=${type.id}`}
                className="flex items-center gap-2 bg-dark-800 border border-dark-700 hover:border-brand-500 px-4 py-2 text-dark-300 hover:text-brand-400 transition-all text-sm font-heading tracking-wider uppercase"
              >
                <span>{type.icon}</span> {type.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED VEHICLES ─── */}
      <section className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="section-subtitle mb-3">Top Picks</p>
              <h2 className="section-title">FEATURED<br />FLEET</h2>
            </div>
            <Link to="/vehicles" className="btn-outline flex items-center gap-2">
              Browse All <HiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {featuredVehicles.map(vehicle => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-subtitle mb-3">Simple Process</p>
            <h2 className="section-title">HOW IT<br />WORKS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

            {[
              { step: '01', title: 'Choose & Search', desc: 'Browse our massive fleet. Filter by type, location, date, and budget. Find your perfect match.' },
              { step: '02', title: 'Book Instantly', desc: 'Select pickup/dropoff dates. Add extras. Pay securely. Get instant confirmation.' },
              { step: '03', title: 'Drive Away', desc: 'Pick up your vehicle. Hit the road. Return when done. It\'s that simple.' },
            ].map(step => (
              <div key={step.step} className="relative flex flex-col items-center text-center group">
                <div className="w-20 h-20 bg-dark-800 border border-dark-700 group-hover:border-brand-500 flex items-center justify-center mb-6 transition-colors glow-orange">
                  <span className="font-display text-3xl text-brand-500">{step.step}</span>
                </div>
                <h3 className="font-heading font-bold text-white text-xl tracking-wide mb-3">{step.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY RENTRIDE ─── */}
      <section className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-subtitle mb-3">Why Us</p>
              <h2 className="section-title mb-8">THE RENTRIDE<br />DIFFERENCE</h2>
              <p className="text-dark-400 leading-relaxed mb-10">
                We've built the most trusted vehicle rental platform in India. Every vehicle is thoroughly inspected, every booking is insured, and our 24/7 support means you're never alone on the road.
              </p>
              <div className="space-y-5">
                {[
                  { icon: HiOutlineShieldCheck, title: 'Fully Insured', desc: 'Every rental comes with comprehensive insurance coverage.' },
                  { icon: HiOutlineClock, title: '24/7 Support', desc: 'Round-the-clock assistance wherever your journey takes you.' },
                  { icon: HiOutlineThumbUp, title: 'Verified Fleet', desc: 'All vehicles are regularly serviced, inspected, and sanitized.' },
                ].map(feature => (
                  <div key={feature.title} className="flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-brand-500/10 border border-brand-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500/20 transition-colors">
                      <feature.icon className="text-brand-400 text-xl" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-white tracking-wide mb-1">{feature.title}</h4>
                      <p className="text-dark-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn-outline flex items-center gap-2 w-fit mt-10">
                Learn More <HiArrowRight />
              </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '1,200+', label: 'Vehicles Available', bg: 'bg-brand-500' },
                { value: '100+', label: 'Cities Covered', bg: 'bg-dark-800 border border-dark-700' },
                { value: '50,000+', label: 'Trips Completed', bg: 'bg-dark-800 border border-dark-700' },
                { value: '4.8 / 5', label: 'Customer Rating', bg: 'bg-dark-800 border border-dark-700' },
              ].map((item, i) => (
                <div key={i} className={`${item.bg} p-8 flex flex-col justify-end aspect-square`}>
                  <div className={`font-display text-4xl ${item.bg.includes('brand') ? 'text-white' : 'text-brand-400'} mb-1`}>
                    {item.value}
                  </div>
                  <div className={`font-heading text-xs tracking-widest uppercase ${item.bg.includes('brand') ? 'text-orange-200' : 'text-dark-400'}`}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-subtitle mb-3">Reviews</p>
            <h2 className="section-title">WHAT RENTERS<br />SAY</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-dark-800 border border-dark-700 p-8 relative group hover:border-brand-500/50 transition-colors">
                <div className="absolute top-6 right-6 text-brand-500/30 font-display text-6xl leading-none">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <span key={i} className="text-brand-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed mb-6 relative z-10">{t.text}</p>
                <div className="flex items-center gap-4 border-t border-dark-700 pt-5">
                  <div className="w-10 h-10 bg-brand-500 flex items-center justify-center font-heading font-bold text-white text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-white text-sm tracking-wide">{t.name}</div>
                    <div className="text-dark-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 bg-brand-500 relative overflow-hidden noise-overlay">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.15) 25%, transparent 25%)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-6xl md:text-8xl text-white mb-4 uppercase">
            START YOUR JOURNEY
          </h2>
          <p className="text-orange-100 text-lg mb-8 font-body max-w-xl mx-auto">
            Join 10,000+ adventurers who trust RentRide for every trip. Your next adventure is one click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vehicles" className="bg-white text-brand-600 font-heading font-bold tracking-widest uppercase px-10 py-4 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
              Browse Fleet <HiArrowRight />
            </Link>
            <Link to="/register" className="bg-transparent border-2 border-white text-white font-heading font-bold tracking-widest uppercase px-10 py-4 hover:bg-white/10 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
