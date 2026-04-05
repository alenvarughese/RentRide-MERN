const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Booking = require('../models/Booking')
const Vehicle = require('../models/Vehicle')
const PDFDocument = require('pdfkit')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')
const sendEmail = require('../utils/sendEmail')
// @GET /api/bookings/admin/analytics — admin only
router.get('/admin/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // 1. Monthly Revenue
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: '$pickupDate' },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    // 2. Most Popular Cars (by booking count)
    const popularVehicles = await Booking.aggregate([
      { $group: { _id: '$vehicle', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'vehicles',
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleInfo'
        }
      },
      { $unwind: '$vehicleInfo' },
      { $project: { name: '$vehicleInfo.name', count: 1 } }
    ])

    // 3. Peak Booking Times (by hour of day)
    const peakTimes = await Booking.aggregate([
      {
        $project: {
          hour: { $hour: '$createdAt' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ])

    // 4. Fleet Utilization (active/confirmed cars / total cars)
    const activeRentals = await Booking.countDocuments({ status: { $in: ['confirmed', 'active'] } })
    const totalVehicles = await Vehicle.countDocuments()
    const fleetUtilization = totalVehicles > 0 ? Math.round((activeRentals / totalVehicles) * 100) : 0

    // 5. Available Fleet (Cars ready for rent)
    const availableFleet = await Vehicle.countDocuments({ available: true, status: 'available' })

    // 6. Pending Verifications
    const pendingVerifications = await User.countDocuments({ isVerified: 'pending' })

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        popularVehicles,
        peakTimes,
        activeRentals,
        fleetUtilization,
        availableFleet,
        pendingVerifications
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupTime, returnTime, selectedAddons, notes, paymentMethod, usePoints } = req.body

    const vehicle = await Vehicle.findById(vehicleId)
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' })
    if (!vehicle.available) return res.status(400).json({ success: false, message: 'Vehicle not available' })

    // Duration logic: 24h cycle
    const start = new Date(`${pickupDate}T${pickupTime}`)
    const end = new Date(`${returnDate}T${returnTime}`)
    const diffInMs = end - start
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const days = Math.max(1, Math.ceil(diffInHours / 24))

    const vehicleCost = vehicle.pricePerDay * days

    const addonPrices = { gps: 199, insurance_plus: 499, driver: 1499, child_seat: 149, helmet: 99, carrier: 249 }
    const addonCost = (selectedAddons || []).reduce((acc, id) => acc + (addonPrices[id] || 0) * days, 0)
    const taxes = Math.round((vehicleCost + addonCost) * 0.18)
    const deposit = 5000
    let totalAmount = vehicleCost + addonCost + taxes + deposit

    // --- Point Redemption Logic ---
    let pointsRedeemed = 0
    if (usePoints && usePoints > 0) {
      const user = await User.findById(req.user._id)
      pointsRedeemed = Math.min(usePoints, user.loyaltyPoints || 0, totalAmount) // 1 point = ₹1
      totalAmount -= pointsRedeemed
      
      // Immediately deduct points
      user.loyaltyPoints -= pointsRedeemed
      await user.save()
    }
    // ------------------------------

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      days,
      vehicleCost,
      addonCost,
      taxes,
      deposit,
      totalAmount,
      selectedAddons,
      notes,
      paymentMethod,
      pointsRedeemed, // Track how many points were used
      status: 'pending', // Refined: Start as pending
      paymentStatus: 'pending',
    })

    // Vehicle remains available until admin confirms
    // await Vehicle.findByIdAndUpdate(vehicleId, { available: false })
    
    await booking.populate('vehicle')

    // Send booking confirmation email (non-blocking)
    const user = await User.findById(req.user._id)
    if (user) {
      sendEmail({
        to: user.email,
        subject: `RentRide — Booking Received #${booking.bookingId}`,
        html: sendEmail.bookingCreatedTemplate({
          name: user.name,
          booking,
          vehicle: booking.vehicle,
        }),
      }).catch(err => console.error('Booking email error:', err.message))
    }

    res.status(201).json({ success: true, booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('vehicle', 'name images type location')
      .sort({ createdAt: -1 })
    res.json({ success: true, bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ $or: [{ _id: req.params.id }, { bookingId: req.params.id }] })
      .populate('vehicle').populate('user', 'name email phone')
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' })
    }
    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorised' })
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` })
    }
    booking.status = 'cancelled'
    booking.cancellationReason = req.body.reason || 'User cancelled'
    booking.cancelledAt = new Date()
    await booking.save()
    await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true })

    // Send cancellation email (non-blocking)
    const vehicle = await Vehicle.findById(booking.vehicle)
    sendEmail({
      to: req.user.email,
      subject: `RentRide — Booking Cancelled #${booking.bookingId}`,
      html: sendEmail.bookingCancelledTemplate({
        name: req.user.name,
        booking,
        vehicle: vehicle || { name: 'Your Vehicle' },
        reason: req.body.reason,
      }),
    }).catch(err => console.error('Cancellation email error:', err.message))

    res.json({ success: true, booking })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ADMIN ROUTES

// @GET /api/bookings - Admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const [bookings, total] = await Promise.all([
      Booking.find()
        .populate('user', 'name email phone')
        .populate('vehicle', 'name images type pricePerDay')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(),
    ])
    res.json({ success: true, count: bookings.length, total, bookings })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @PATCH /api/bookings/:id/status - Admin only
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, paymentStatus } = req.body
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })

    const oldStatus = booking.status
    if (status) {
      // If status changes to confirmed/active/pending, mark vehicle as unavailable ONLY if confirmed/active
      if (['confirmed', 'active'].includes(status)) {
        await Vehicle.findByIdAndUpdate(booking.vehicle, { available: false, status: 'rented' })
      } 
      // If status changes to cancelled/completed, make vehicle available
      else if (['cancelled', 'completed'].includes(status)) {
        await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true, status: 'available' })
      }
      booking.status = status
    }
    
    if (paymentStatus) booking.paymentStatus = paymentStatus
    
    // --- Loyalty & Referral Points Logic ---
    if (status === 'completed' && oldStatus !== 'completed' && booking.pointsEarned === 0) {
      const user = await User.findById(booking.user)
      if (user) {
        const earned = Math.floor(booking.totalAmount / 100)
        user.loyaltyPoints = (user.loyaltyPoints || 0) + earned
        booking.pointsEarned = earned

        // Reward for first completed booking if referred
        const completedCount = await Booking.countDocuments({ user: user._id, status: 'completed' })
        if (completedCount === 0 && user.referredBy) {
          const referrer = await User.findOne({ referralCode: user.referredBy })
          if (referrer) {
            referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 500
            user.loyaltyPoints += 200
            await referrer.save()
          }
        }
        await user.save()
      }
    }
    // ----------------------------------------
    
    await booking.save()

    // Send status update email to the user (non-blocking)
    if (status) {
      try {
        const bookedUser = await User.findById(booking.user)
        const vehicle = await Vehicle.findById(booking.vehicle)
        if (bookedUser && vehicle) {
          sendEmail({
            to: bookedUser.email,
            subject: `RentRide — Booking ${status.charAt(0).toUpperCase() + status.slice(1)} #${booking.bookingId}`,
            html: sendEmail.bookingStatusTemplate({
              name: bookedUser.name,
              booking,
              vehicle,
              status,
            }),
          }).catch(err => console.error('Status update email error:', err.message))
        }
      } catch (emailErr) {
        console.error('Status email lookup error:', emailErr.message)
      }
    }

    res.json({ success: true, booking })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @GET /api/bookings/:id/invoice - Generate PDF Invoice
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const id = req.params.id
    const query = mongoose.Types.ObjectId.isValid(id) 
      ? { $or: [{ _id: id }, { bookingId: id }] }
      : { bookingId: id }
      
    const booking = await Booking.findOne(query)
      .populate('vehicle').populate('user', 'name email')
    
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' })
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' })
    }

    const doc = new PDFDocument({ margin: 50 })
    const filename = `Invoice-${booking.bookingId}.pdf`

    res.setHeader('Content-disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-type', 'application/pdf')

    doc.pipe(res)

    // Header
    doc.fillColor('#f97316').fontSize(30).text('RENTRIDE', 50, 50, { align: 'left' })
    doc.fillColor('#444444').fontSize(10).text('Premium Car Rental Service', 50, 85)
    doc.fontSize(20).text('INVOICE', 0, 50, { align: 'right' })
    doc.fontSize(10).text(`Invoice #: ${booking.bookingId}`, 0, 75, { align: 'right' })
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 0, 90, { align: 'right' })

    doc.moveDown(2)
    doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, 120).lineTo(550, 120).stroke()

    // Bill To
    doc.fontSize(12).fillColor('#000000').text('BILL TO:', 50, 140)
    doc.fontSize(10).fillColor('#444444').text(booking.user?.name || 'Customer', 50, 155)
    doc.text(booking.user?.email || '', 50, 170)

    // Vehicle Info
    doc.fontSize(12).fillColor('#000000').text('VEHICLE:', 300, 140)
    doc.fontSize(10).fillColor('#444444').text(booking.vehicle?.name || 'N/A', 300, 155)
    doc.text(`${booking.days || 1} Days Rental`, 300, 170)
    doc.text(`${booking.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : ''} to ${booking.returnDate ? new Date(booking.returnDate).toLocaleDateString() : ''}`, 300, 185)

    doc.moveDown(4)

    // Table Header
    const tableTop = 240
    doc.fontSize(10).fillColor('#000000').font('Helvetica-Bold')
    doc.text('Description', 50, tableTop)
    doc.text('Amount', 450, tableTop, { align: 'right' })
    doc.strokeColor('#eeeeee').moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke()

    // Table Content
    let y = tableTop + 30
    doc.font('Helvetica')
    doc.text(`Vehicle Rental (${booking.days || 1} days x Rs. ${booking.vehicle?.pricePerDay || 0})`, 50, y)
    doc.text(`Rs. ${(booking.vehicleCost || 0).toLocaleString()}`, 450, y, { align: 'right' })
    
    y += 20
    doc.text('Add-ons (GPS, Insurance, etc.)', 50, y)
    doc.text(`Rs. ${(booking.addonCost || 0).toLocaleString()}`, 450, y, { align: 'right' })

    y += 20
    doc.text('Taxes (GST 18%)', 50, y)
    doc.text(`Rs. ${(booking.taxes || 0).toLocaleString()}`, 450, y, { align: 'right' })

    y += 20
    doc.text('Security Deposit (Refundable)', 50, y)
    doc.text(`Rs. ${(booking.deposit || 0).toLocaleString()}`, 450, y, { align: 'right' })

    if (booking.discount > 0) {
      y += 20
      doc.fillColor('#10b981').text(`Promo Discount (${booking.promoCode || 'PRM'})`, 50, y)
      doc.text(`- Rs. ${(booking.discount || 0).toLocaleString()}`, 450, y, { align: 'right' })
    }

    doc.moveDown(2)
    y += 40
    doc.strokeColor('#f97316').lineWidth(2).moveTo(350, y).lineTo(550, y).stroke()
    
    y += 15
    doc.fontSize(15).fillColor('#000000').font('Helvetica-Bold').text('TOTAL PAID:', 350, y)
    doc.fillColor('#f97316').text(`Rs. ${(booking.totalAmount || 0).toLocaleString()}`, 450, y, { align: 'right' })

    // Footer
    doc.fontSize(10).fillColor('#888888').font('Helvetica').text('Thank you for choosing RentRide!', 50, 700, { align: 'center', width: 500 })
    doc.text('This is a computer generated invoice and does not require a physical signature.', 50, 715, { align: 'center', width: 500 })

    doc.end()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
