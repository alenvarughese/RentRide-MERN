import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { HiOutlineChevronLeft, HiOutlineCloudUpload, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'
import { getImageUrl } from '../utils/imageUrl'

const vehicleTypes = ['car', 'suv', 'bike', 'scooter', 'truck', 'van', 'boat', 'rv', 'other']
const transmissions = ['Automatic', 'Manual', 'Semi-Automatic', 'Jet Drive']
const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
const statuses = ['available', 'maintenance', 'out-of-service']

export default function VehicleFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'car',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    pricePerDay: '',
    pricePerHour: '',
    seats: 4,
    location: '',
    description: '',
    images: [],
    features: [],
    status: 'available',
    plateNumber: ''
  })

  useEffect(() => {
    if (isEdit) {
      const fetchVehicle = async () => {
        try {
          const { data } = await axios.get(`/api/vehicles/${id}`)
          const v = data.vehicle
          setFormData({
            ...v,
            pricePerDay: v.pricePerDay || '',
            pricePerHour: v.pricePerHour || '',
          })
        } catch (err) {
          toast.error('Failed to fetch vehicle details')
          navigate('/admin/dashboard')
        } finally {
          setFetching(false)
        }
      }
      fetchVehicle()
    }
  }, [id, isEdit, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFeatureAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const val = e.target.value.trim()
      if (!formData.features.includes(val)) {
        setFormData(prev => ({ ...prev, features: [...prev.features, val] }))
      }
      e.target.value = ''
    }
  }

  const removeFeature = (feat) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feat) }))
  }

  const handleImageFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) {
      setImageFiles(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setImagePreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
  }

  const removeImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Use FormData for multipart submission
    const data = new FormData()
    data.append('name', formData.name)
    data.append('brand', formData.brand)
    data.append('model', formData.model)
    data.append('year', formData.year)
    data.append('type', formData.type)
    data.append('transmission', formData.transmission)
    data.append('fuelType', formData.fuelType)
    data.append('pricePerDay', formData.pricePerDay || 0)
    data.append('pricePerHour', formData.pricePerHour || 0)
    data.append('seats', formData.seats || 4)
    data.append('location', formData.location || '')
    data.append('description', formData.description || '')
    data.append('status', formData.status)
    data.append('plateNumber', formData.plateNumber || '')
    
    formData.features.forEach(feat => {
      data.append('features', feat)
    })
    
    // Keep existing URL images
    formData.images.forEach(img => {
      data.append('images', img)
    })
    
    // Append new files
    imageFiles.forEach(file => {
      data.append('imageFiles', file)
    })

    try {
      if (isEdit) {
        await axios.put(`/api/vehicles/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Vehicle updated successfully')
      } else {
        await axios.post('/api/vehicles', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Vehicle added to fleet')
      }
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-8 font-heading text-sm tracking-widest uppercase"
        >
          <HiOutlineChevronLeft /> Back to Dashboard
        </button>

        <div className="bg-dark-900 border border-dark-800 shadow-2xl p-8 md:p-12">
          <div className="mb-10">
            <p className="section-subtitle mb-2">{isEdit ? 'Modification' : 'Fleet Expansion'}</p>
            <h1 className="font-display text-4xl text-white">{isEdit ? 'EDIT VEHICLE' : 'ADD NEW VEHICLE'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Vehicle Display Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Porsche 911 Carrera"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Vehicle Type</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {vehicleTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Brand</label>
                <input
                  required
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Porsche"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Model</label>
                <input
                  required
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. 911"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Year</label>
                <input
                  required
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            {/* Technical Specs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-dark-800">
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Transmission</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange} className="input-field">
                  {transmissions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Fuel Type</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="input-field">
                  {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Seats</label>
                <input required type="number" name="seats" value={formData.seats} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Price Per Day (₹)</label>
                <input required type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {/* Location & Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="md:col-span-1">
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Location</label>
                <input required name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Mumbai" className="input-field" />
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Fleet Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                  {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">License Plate</label>
                <input name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="MH 01 AB 1234" className="input-field" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Vehicle Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4" 
                className="input-field resize-none"
                placeholder="Describe the vehicle's unique selling points..."
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase mb-2">Features (Press Enter to Add)</label>
              <input 
                onKeyDown={handleFeatureAdd}
                placeholder="e.g. Panoramic Sunroof, ADAS, 360 Camera"
                className="input-field mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {formData.features.map(f => (
                  <span key={f} className="flex items-center gap-2 bg-dark-800 text-white px-3 py-1 text-xs border border-dark-700">
                    {f}
                    <button type="button" onClick={() => removeFeature(f)} className="text-red-500 hover:text-red-400">
                      <HiOutlineTrash />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-dark-400 font-heading text-xs tracking-widest uppercase">Vehicle Gallery</label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Existing Images */}
                {formData.images.map((img, idx) => (
                  <div key={`exist-${idx}`} className="relative aspect-video group">
                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover border border-dark-700" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineTrash />
                    </button>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-dark-900/80 text-white text-[9px] uppercase tracking-widest">Existing</div>
                  </div>
                ))}
                
                {/* New Image Previews */}
                {imagePreviews.map((img, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-video group">
                    <img src={img} alt="" className="w-full h-full object-cover border border-brand-500/50" />
                    <button 
                      type="button"
                      onClick={() => removeImageFile(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiOutlineTrash />
                    </button>
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-500 text-white text-[9px] uppercase tracking-widest">New</div>
                  </div>
                ))}

                <label className="aspect-video border-2 border-dashed border-dark-700 flex flex-col items-center justify-center text-dark-500 hover:text-brand-400 hover:border-brand-500 transition-all cursor-pointer">
                  <input type="file" multiple accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  <HiOutlineCloudUpload className="text-2xl mb-1" />
                  <span className="text-[10px] font-heading tracking-widest uppercase">Select Files</span>
                </label>
              </div>
            </div>

            <div className="pt-10 flex gap-4">
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1 py-4 text-sm font-heading tracking-widest uppercase shadow-2xl shadow-brand-500/20"
              >
                {loading ? 'Processing...' : isEdit ? 'Update Vehicle Details' : 'Initialize Vehicle in Fleet'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/admin/dashboard')}
                className="btn-outline px-10 py-4 text-sm font-heading tracking-widest uppercase"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
