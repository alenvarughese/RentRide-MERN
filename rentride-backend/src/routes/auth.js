const express = require('express')
const router = express.Router()
const crypto = require('crypto')
const User = require('../models/User')
const { protect } = require('../middleware/auth')
const sendEmail = require('../utils/sendEmail')

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, referredBy } = req.body
    
    // Explicit Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }
    const emailRegex = /^\w+([\.-]?\w+)*@gmail\.com$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Only Gmail addresses are allowed' })
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' })
    }

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' })

    const user = await User.create({ name, email, phone, password, referredBy })
    const token = user.getSignedJwtToken()

    // Send welcome email (non-blocking)
    sendEmail({
      to: user.email,
      subject: '🚗 Welcome to RentRide!',
      html: sendEmail.welcomeTemplate({ name: user.name }),
    }).catch(err => console.error('Welcome email error:', err.message))

    res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' })
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }
    const token = user.getSignedJwtToken()
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

// @POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ success: false, message: 'Please provide your email' })

    const user = await User.findOne({ email })
    // Always respond with the same message to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, you will receive a reset link.' })
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    await sendEmail({
      to: user.email,
      subject: 'RentRide — Password Reset Request',
      html: sendEmail.resetPasswordTemplate({ name: user.name, resetUrl }),
    })

    res.json({ success: true, message: 'If that email is registered, you will receive a reset link.' })
  } catch (err) {
    // If email sending fails, clear the token to allow retry
    try {
      const user = await User.findOne({ email: req.body.email })
      if (user) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false })
      }
    } catch (_) {}
    console.error('Forgot password error:', err.message)
    res.status(500).json({ success: false, message: 'Email could not be sent. Please try again later.' })
  }
})

// @POST /api/auth/resetpassword/:token
router.post('/resetpassword/:token', async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    const token = user.getSignedJwtToken()
    res.json({ success: true, token, message: 'Password reset successful', user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
