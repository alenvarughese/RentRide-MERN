const express = require('express')
const router = express.Router()
const Coupon = require('../models/Coupon')
const { protect, authorize } = require('../middleware/auth')

// @POST /api/coupons/validate
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, amount } = req.body
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive promo code.' })
    }

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo code has expired.' })
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Promo code usage limit reached.' })
    }

    if (amount < coupon.minBookingAmount) {
      return res.status(400).json({ 
        success: false, 
        message: `Min. booking amount for this code is ₹${coupon.minBookingAmount}` 
      })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountAmount) / 100
    } else {
      discount = coupon.discountAmount
    }

    res.json({ 
      success: true, 
      discount, 
      code: coupon.code,
      message: 'Promo code applied successfully!' 
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @POST /api/coupons — admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json({ success: true, coupon })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @GET /api/coupons — admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.json({ success: true, coupons })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @DELETE /api/coupons/:id — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Coupon deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
