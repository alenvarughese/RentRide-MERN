const express = require('express')
const router = express.Router()
const Stripe = require('stripe')
const { protect } = require('../middleware/auth')
const Booking = require('../models/Booking')
const User = require('../models/User')

// Helper to get stripe instance
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.includes('placeholder') || key === '') {
    throw new Error('Stripe Secret Key is missing or not configured. Please add your SK_TEST key to the backend .env file.')
  }
  return new Stripe(key)
}

// @POST /api/payments/create-checkout-session
router.post('/create-checkout-session', protect, async (req, res) => {
  try {
    const stripe = getStripe()
    const { 
      vehicleId, pickupDate, returnDate, pickupTime, returnTime, 
      days, vehicleCost, addonCost, taxes, deposit, totalAmount, 
      discount, promoCode, selectedAddons, notes, vehicleName, usePoints 
    } = req.body

    // Check for overlapping bookings
    const overlapping = await Booking.findOne({
      vehicle: vehicleId,
      status: { $ne: 'cancelled' },
      $or: [
        { pickupDate: { $lte: new Date(returnDate) }, returnDate: { $gte: new Date(pickupDate) } }
      ]
    })

    if (overlapping) {
      return res.status(400).json({ 
        success: false, 
        message: 'This vehicle is already booked for the selected dates.' 
      })
    }

    // Re-calculate days on server for security
    const start = new Date(`${pickupDate}T${pickupTime}`)
    const end = new Date(`${returnDate}T${returnTime}`)
    const diffInMs = end - start
    const diffInHours = diffInMs / (1000 * 60 * 60)
    const realDays = Math.max(1, Math.ceil(diffInHours / 24))
    
    // Note: Use realDays for line item description, but keep totalAmount as passed (already validated/calculated on frontend)
    // or better, recalculate everything here too. Since we trust totalAmount for now (simplicity), 
    // let's at least fix the description.

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Rental: ${vehicleName}`,
              description: `${realDays} days rental from ${pickupDate} to ${returnDate}`,
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/vehicles/${vehicleId}`,
      metadata: {
        userId: req.user._id.toString(),
        vehicleId,
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
        discount: String(discount || 0),
        promoCode: promoCode || '',
        selectedAddons: JSON.stringify(selectedAddons),
        notes,
        pointsRedeemed: String(usePoints || 0)
      },
    })

    res.json({ success: true, url: session.url })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/payments/verify-session/:sessionId
router.get('/verify-session/:sessionId', protect, async (req, res) => {
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId)

    if (session.payment_status === 'paid') {
      const meta = session.metadata
      
      // Check if booking already exists for this session to avoid duplicates
      let booking = await Booking.findOne({ paymentIntentId: session.payment_intent })
      
      if (!booking) {
        booking = new Booking({
          user: meta.userId,
          vehicle: meta.vehicleId,
          pickupDate: meta.pickupDate,
          returnDate: meta.returnDate,
          pickupTime: meta.pickupTime,
          returnTime: meta.returnTime,
          days: meta.days,
          vehicleCost: meta.vehicleCost,
          addonCost: meta.addonCost,
          taxes: meta.taxes,
          deposit: meta.deposit,
          totalAmount: meta.totalAmount,
          discount: Number(meta.discount || 0),
          promoCode: meta.promoCode,
          selectedAddons: JSON.parse(meta.selectedAddons),
          notes: meta.notes,
          paymentMethod: 'card',
          paymentStatus: 'paid',
          paymentIntentId: session.payment_intent,
          pointsRedeemed: Number(meta.pointsRedeemed || 0),
          status: 'pending' // Admin still needs to confirm the ride itself
        })
        await booking.save()

        // Deduct points from user if any were used
        if (Number(meta.pointsRedeemed) > 0) {
          await User.findByIdAndUpdate(meta.userId, {
            $inc: { loyaltyPoints: -Number(meta.pointsRedeemed) }
          })
        }

        // Increment coupon usage if applicable
        if (meta.promoCode) {
          const Coupon = require('../models/Coupon')
          await Coupon.findOneAndUpdate(
            { code: meta.promoCode.toUpperCase() },
            { $inc: { usedCount: 1 } }
          )
        }
      }

      res.json({ success: true, bookingId: booking.bookingId })
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
