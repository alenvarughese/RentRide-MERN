const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  pickupDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  pickupTime: { type: String, required: true },
  returnTime: { type: String, required: true },
  days: { type: Number, required: true },
  vehicleCost: { type: Number, required: true },
  addonCost: { type: Number, default: 0 },
  taxes: { type: Number, default: 0 },
  deposit: { type: Number, default: 5000 },
  totalAmount: { type: Number, required: true },
  selectedAddons: [{ type: String }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'netbanking', 'cash'] },
  paymentIntentId: { type: String },
  discount: { type: Number, default: 0 },
  promoCode: { type: String },
  notes: String,
  cancellationReason: String,
  cancelledAt: Date,
  pointsRedeemed: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
}, { timestamps: true })

bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = `BK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`
  }
  next()
})

bookingSchema.index({ user: 1, status: 1 })
bookingSchema.index({ vehicle: 1, pickupDate: 1, returnDate: 1 })

module.exports = mongoose.model('Booking', bookingSchema)
