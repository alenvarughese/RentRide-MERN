const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const slugify = require('slugify')
const Vehicle = require('../models/Vehicle')
const Booking = require('../models/Booking')
const { protect, authorize } = require('../middleware/auth')

// Ensure directory exists
const uploadDir = 'uploads/vehicles'
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const uploadVehicle = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } })

// @POST /api/vehicles/refresh-status — admin only: Batch-check expiry and auto-update status
router.post('/refresh-status', protect, authorize('admin'), async (req, res) => {
  try {
    const now = new Date()
    const vehicles = await Vehicle.find({})
    let updated = 0

    for (const vehicle of vehicles) {
      const ms = vehicle.maintenanceStatus || {}
      let newStatus = vehicle.status

      const insExpired = ms.insuranceExpiry && new Date(ms.insuranceExpiry) < now
      const pucExpired = ms.pucExpiry && new Date(ms.pucExpiry) < now
      const svcOverdue = ms.nextServiceDate && new Date(ms.nextServiceDate) < now

      if (insExpired) {
        newStatus = 'out-of-service'
      } else if ((pucExpired || svcOverdue) && vehicle.status !== 'out-of-service') {
        newStatus = 'maintenance'
      }

      if (newStatus !== vehicle.status) {
        vehicle.status = newStatus
        vehicle.available = (newStatus === 'available')
        await vehicle.save()
        updated++
      }
    }

    res.json({ success: true, message: `Status refreshed. ${updated} vehicles updated.`, updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/vehicles — list with filters
router.get('/', async (req, res) => {
  try {
    const { type, transmission, fuel, available, status, minPrice, maxPrice, location, sort, q, page = 1, limit = 12 } = req.query
    const query = {}
    if (type && type !== 'all') query.type = type
    if (transmission && transmission !== 'All') query.transmission = transmission
    if (fuel && fuel !== 'All') query.fuelType = fuel
    if (available === 'true') query.available = true
    if (status && status !== 'all') query.status = status
    if (location) query.location = { $regex: location, $options: 'i' }
    if (minPrice || maxPrice) {
      query.pricePerDay = {}
      if (minPrice) query.pricePerDay.$gte = Number(minPrice)
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice)
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { model: { $regex: q, $options: 'i' } },
      ]
    }

    const sortMap = {
      'price-asc': { pricePerDay: 1 },
      'price-desc': { pricePerDay: -1 },
      'rating': { rating: -1 },
      'popular': { reviewCount: -1 },
    }
    const sortObj = sortMap[sort] || { reviewCount: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Vehicle.countDocuments(query),
    ])

    res.json({ success: true, count: vehicles.length, total, page: Number(page), pages: Math.ceil(total / limit), vehicles })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/vehicles/:id
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' })
    res.json({ success: true, vehicle })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @POST /api/vehicles — admin only
router.post('/', protect, authorize('admin'), uploadVehicle.array('imageFiles', 10), async (req, res) => {
  try {
    let images = []
    if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
    }
    if (req.files) {
      const fileUrls = req.files.map(f => `/${f.path.replace(/\\/g, '/')}`)
      images = [...images, ...fileUrls]
    }
    
    const vehicleData = { 
      ...req.body, 
      images,
      slug: slugify(`${req.body.name}-${Date.now().toString().slice(-4)}`, { lower: true, strict: true })
    }
    const vehicle = await Vehicle.create(vehicleData)
    res.status(201).json({ success: true, vehicle })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @PUT /api/vehicles/:id — admin only
router.put('/:id', protect, authorize('admin'), uploadVehicle.array('imageFiles', 10), async (req, res) => {
  try {
    const vehicleData = { ...req.body }
    
    // Only update images if we are sending them (i.e from standard edit form vs just a status toggle)
    if (req.body.images || req.files?.length > 0) {
      let images = []
      if (req.body.images) {
        images = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
      }
      if (req.files) {
        const fileUrls = req.files.map(f => `/${f.path.replace(/\\/g, '/')}`)
        images = [...images, ...fileUrls]
      }
      vehicleData.images = images
    }
    
    if (req.body.name) {
      vehicleData.slug = slugify(`${req.body.name}-${Date.now().toString().slice(-4)}`, { lower: true, strict: true })
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, vehicleData, { new: true, runValidators: true })
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' })
    res.json({ success: true, vehicle })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @DELETE /api/vehicles/:id — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id)
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' })
    res.json({ success: true, message: 'Vehicle deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/vehicles/:id/busy-dates
router.get('/:id/busy-dates', async (req, res) => {
  try {
    const bookings = await Booking.find({
      vehicle: req.params.id,
      status: { $ne: 'cancelled' },
      paymentStatus: { $ne: 'failed' }
    }).select('pickupDate returnDate')

    const busyDates = bookings.map(b => ({
      start: b.pickupDate,
      end: b.returnDate
    }))

    res.json({ success: true, busyDates })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @POST /api/vehicles/:id/maintenance — admin only: Log a new maintenance task
router.post('/:id/maintenance', protect, authorize('admin'), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' })

    vehicle.maintenanceLogs.unshift(req.body)
    await vehicle.save()

    res.json({ success: true, maintenanceLogs: vehicle.maintenanceLogs })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @PATCH /api/vehicles/:id/maintenance-status — admin only: Update expiry dates
router.patch('/:id/maintenance-status', protect, authorize('admin'), async (req, res) => {
  try {
    console.log(`[MAINTENANCE STATUS] Patching status for ID: ${req.params.id}`, req.body)
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      console.log(`[MAINTENANCE STATUS] Vehicle NOT FOUND for ID: ${req.params.id}`)
      return res.status(404).json({ success: false, message: 'Vehicle not found' })
    }

    vehicle.maintenanceStatus = { ...vehicle.maintenanceStatus, ...req.body }
    await vehicle.save()

    res.json({ success: true, maintenanceStatus: vehicle.maintenanceStatus, status: vehicle.status, available: vehicle.available })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

module.exports = router
