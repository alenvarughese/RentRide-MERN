const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([\.-]?\w+)*@gmail\.com$/, 'Only Gmail addresses are allowed']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String },
  drivingLicense: { type: String },
  drivingLicenseImage: { type: String },
  isVerified: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },
  address: {
    street: String, city: String, state: String, pincode: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  loyaltyPoints: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.referralCode) {
    // Generate a simple 6-char code
    this.referralCode = 'RIDE-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  })
}

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 minutes
  return resetToken
}

module.exports = mongoose.model('User', userSchema)
