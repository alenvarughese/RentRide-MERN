const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  type: {
    type: String,
    required: true,
    enum: ['car', 'suv', 'bike', 'scooter', 'truck', 'van', 'boat', 'rv', 'other'],
  },
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  color: String,
  seats: { type: Number, required: true },
  transmission: { type: String, enum: ['Automatic', 'Manual', 'Semi-Automatic', 'Jet Drive'], required: true },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'], required: true },
  pricePerDay: { type: Number, required: true, min: 0 },
  pricePerHour: { type: Number, required: true, min: 0 },
  plateNumber: { 
    type: String, 
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2}\s?[0-9]{2}\s?[A-Z]{0,2}\s?[0-9]{1,4}$/i, 'Please enter a valid Indian number plate (e.g. MH 01 AB 1234 or MH01AB1234)']
  },
  available: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['available', 'rented', 'maintenance', 'out-of-service'], 
    default: 'available' 
  },
  images: [{ type: String }],
  features: [{ type: String }],
  description: { type: String },
  location: { type: String, required: true },
  mileageLimit: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  maintenanceStatus: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    insuranceExpiry: Date,
    pucExpiry: Date,
    currentOdometer: { type: Number, default: 0 }
  },
  maintenanceLogs: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Service', 'Repair', 'Inspection', 'Insurance', 'PUC', 'Other'] },
    cost: { type: Number, default: 0 },
    description: String,
    performedBy: String
  }]
}, { timestamps: true })

// Sync availability with status and handle auto-toggles
vehicleSchema.pre('save', function (next) {
  const now = new Date()
  
  const insExpiry = this.maintenanceStatus?.insuranceExpiry ? new Date(this.maintenanceStatus.insuranceExpiry) : null
  const pucExpiry = this.maintenanceStatus?.pucExpiry ? new Date(this.maintenanceStatus.pucExpiry) : null
  const svcDate = this.maintenanceStatus?.nextServiceDate ? new Date(this.maintenanceStatus.nextServiceDate) : null

  // Auto-status based on dates
  if (insExpiry && insExpiry < now) {
    this.status = 'out-of-service'
  } 
  else if ((svcDate && svcDate < now) || (pucExpiry && pucExpiry < now)) {
    if (this.status !== 'out-of-service') {
      this.status = 'maintenance'
    }
  }
  // Auto-return to available if everything is fixed and it was in a blocked state
  else if (this.status === 'maintenance' || this.status === 'out-of-service') {
    this.status = 'available'
  }

  // Final availability sync
  this.available = (this.status === 'available')
  next()
})

vehicleSchema.index({ type: 1 })
vehicleSchema.index({ location: 1 })
vehicleSchema.index({ pricePerDay: 1 })
vehicleSchema.index({ available: 1 })

module.exports = mongoose.model('Vehicle', vehicleSchema)
