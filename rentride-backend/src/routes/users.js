const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

// @GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, address, drivingLicense, drivingLicenseImage } = req.body
    
    const updateData = { name, phone, address, drivingLicense }
    if (drivingLicenseImage) {
      updateData.drivingLicenseImage = drivingLicenseImage
      updateData.isVerified = 'pending'
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    )
    res.json({ success: true, user })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @POST /api/users/upload-license
router.post('/upload-license', protect, upload.single('license'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' })
    }

    const imageUrl = `/uploads/licenses/${req.file.filename}`
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        drivingLicenseImage: imageUrl,
        isVerified: 'pending'
      },
      { new: true }
    )

    res.json({ 
      success: true, 
      message: 'License uploaded successfully',
      imageUrl,
      user
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @PATCH /api/users/:id/verify — admin only
router.patch('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' })
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: status },
      { new: true }
    )
    res.json({ success: true, user })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @PUT /api/users/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// @GET /api/users — admin only
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(),
    ])
    res.json({ success: true, count: users.length, total, users })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// @DELETE /api/users/:id — admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
