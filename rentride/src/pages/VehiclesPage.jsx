import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiOutlineFilter, HiOutlineSearch, HiOutlineAdjustments, HiX } from 'react-icons/hi'
import axios from 'axios'
import { vehicleTypes } from '../utils/mockData'
import VehicleCard from '../components/vehicles/VehicleCard'

const transmissions = ['All', 'Automatic', 'Manual']
const fuelTypes = ['All', 'Petrol', 'Diesel', 'Electric']
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const activeType = searchParams.get('type') || 'all'
  const activeTransmission = searchParams.get('transmission') || 'All'
  const activeFuel = searchParams.get('fuel') || 'All'
  const searchQ = searchParams.get('q') || ''
  const sortBy = searchParams.get('sort') || 'popular'
  const availableOnly = searchParams.get('available') === 'true'
  const maxPrice = parseInt(searchParams.get('maxPrice') || '15000')

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        console.log('📡 Fetching vehicles from:', axios.defaults.baseURL + '/api/vehicles')
        const { data } = await axios.get('/api/vehicles')
        console.log('✅ Vehicles received:', data.count)
        setVehicles(data.vehicles || [])
      } catch (err) {
        console.error('❌ API Error:', err)
        setError(err.response?.data?.message || 'Failed to fetch vehicles')
      } finally {
        setLoading(false)
      }
    }
    fetchVehicles()
  }, [])

  const filtered = useMemo(() => {
    let result = [...vehicles]
    // Filter for only 'available' status vehicles for users
    result = result.filter(v => v.status === 'available')
    
    if (activeType !== 'all') result = result.filter(v => v.type === activeType)
    if (activeTransmission !== 'All') result = result.filter(v => v.transmission === activeTransmission)
    if (activeFuel !== 'All') result = result.filter(v => v.fuelType === activeFuel)
    if (availableOnly) result = result.filter(v => v.available)
    if (searchQ) result = result.filter(v =>
      v.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQ.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQ.toLowerCase())
    )
    result = result.filter(v => v.pricePerDay <= maxPrice)

    switch (sortBy) {
      case 'price-asc': return result.sort((a, b) => a.pricePerDay - b.pricePerDay)
      case 'price-desc': return result.sort((a, b) => b.pricePerDay - a.pricePerDay)
      case 'rating': return result.sort((a, b) => b.rating - a.rating)
      default: return result.sort((a, b) => b.reviewCount - a.reviewCount)
    }
  }, [vehicles, activeType, activeTransmission, activeFuel, availableOnly, searchQ, maxPrice, sortBy])

  const FilterPanel = () => (
    <aside className="w-full space-y-6">
      {/* Search */}
      <div>
        <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-2 block">Search</label>
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            value={searchQ}
            onChange={e => updateParam('q', e.target.value)}
            placeholder="Vehicle, brand, location..."
            className="input-field pl-10 text-sm"
          />
        </div>
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-3 block">Vehicle Type</label>
        <div className="space-y-1">
          {vehicleTypes.map(type => (
            <button
              key={type.id}
              onClick={() => updateParam('type', type.id === 'all' ? null : type.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-heading tracking-wider transition-colors text-left ${
                activeType === type.id
                  ? 'bg-brand-500/20 text-brand-400 border-l-2 border-brand-500'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <span>{type.icon}</span> {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transmission */}
      <div>
        <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-3 block">Transmission</label>
        <div className="flex flex-wrap gap-2">
          {transmissions.map(t => (
            <button
              key={t}
              onClick={() => updateParam('transmission', t === 'All' ? null : t)}
              className={`px-3 py-1 text-xs font-heading tracking-wider uppercase border transition-colors ${
                activeTransmission === t
                  ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                  : 'border-dark-700 text-dark-400 hover:border-dark-500'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-3 block">Fuel Type</label>
        <div className="flex flex-wrap gap-2">
          {fuelTypes.map(f => (
            <button
              key={f}
              onClick={() => updateParam('fuel', f === 'All' ? null : f)}
              className={`px-3 py-1 text-xs font-heading tracking-wider uppercase border transition-colors ${
                activeFuel === f
                  ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                  : 'border-dark-700 text-dark-400 hover:border-dark-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="font-heading text-xs tracking-widest uppercase text-dark-400 mb-3 block">
          Max Price: <span className="text-brand-400">₹{maxPrice.toLocaleString()}/day</span>
        </label>
        <input
          type="range"
          min={500}
          max={15000}
          step={500}
          value={maxPrice}
          onChange={e => updateParam('maxPrice', e.target.value)}
          className="w-full accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-xs text-dark-500 mt-1 font-body">
          <span>₹500</span><span>₹15,000</span>
        </div>
      </div>

      {/* Available Only */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className={`w-10 h-5 relative transition-colors ${availableOnly ? 'bg-brand-500' : 'bg-dark-700'}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={e => updateParam('available', e.target.checked ? 'true' : null)}
          className="sr-only"
        />
        <span className="text-dark-300 text-sm font-heading tracking-wider uppercase group-hover:text-white transition-colors">
          Available Only
        </span>
      </label>

      {/* Clear filters */}
      <button
        onClick={() => setSearchParams({})}
        className="w-full text-red-400 border border-red-400/30 py-2 font-heading text-xs tracking-widest uppercase hover:bg-red-400/10 transition-colors flex items-center justify-center gap-2"
      >
        <HiX /> Clear All Filters
      </button>
    </aside>
  )

  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      {/* Page header */}
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="section-subtitle mb-2">Explore Our Fleet</p>
          <h1 className="font-display text-5xl md:text-6xl text-white">
            {activeType === 'all' ? 'ALL VEHICLES' : vehicleTypes.find(t => t.id === activeType)?.label.toUpperCase() || 'VEHICLES'}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-dark-900 border border-dark-800 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineAdjustments className="text-brand-500" />
                <h3 className="font-heading font-semibold tracking-widest uppercase text-white text-sm">Filters</h3>
              </div>
              <FilterPanel />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <p className="text-dark-400 text-sm font-body">
                <span className="text-white font-semibold">{filtered.length}</span> vehicles found
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden btn-outline text-sm py-2 flex items-center gap-2"
                >
                  <HiOutlineFilter /> Filters
                </button>
                <select
                  value={sortBy}
                  onChange={e => updateParam('sort', e.target.value)}
                  className="bg-dark-800 border border-dark-700 text-dark-300 text-sm px-4 py-2 outline-none font-heading tracking-wider cursor-pointer focus:border-brand-500 transition-colors"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
                <p className="text-dark-400 font-heading tracking-widest uppercase text-sm">Loading Fleet...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="font-display text-3xl text-white mb-2">Error Loading Vehicles</h3>
                <p className="text-dark-400 mb-6">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(vehicle => (
                  <VehicleCard key={vehicle._id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-3xl text-white mb-2">No Vehicles Found</h3>
                <p className="text-dark-400 mb-6">Try adjusting your filters or search query.</p>
                <button onClick={() => setSearchParams({})} className="btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-dark-900 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold tracking-widest uppercase text-white">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-dark-400 hover:text-white text-xl">
                <HiX />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  )
}
