const express = require('express')
const router = express.Router()
const Review = require('../models/Review')
const Booking = require('../models/Booking')
const { protect } = require('../middleware/auth')

// @POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, bookingId, rating, comment } = req.body

    // Verify booking belongs to user and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      status: 'completed'
    })

    if (!booking) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only completed bookings can be reviewed.' 
      })
    }

    // Check if review already exists
    const existing = await Review.findOne({ booking: bookingId })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' })
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: vehicleId,
      booking: bookingId,
      rating,
      comment
    })

    res.status(201).json({ success: true, review })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/reviews/vehicle/:vehicleId
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate('user', 'name')
      .sort('-createdAt')
    res.json({ success: true, reviews })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
