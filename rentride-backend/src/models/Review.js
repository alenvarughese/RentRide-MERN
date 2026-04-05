const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  }
}, { timestamps: true })

// After saving a review, update the vehicle's average rating
reviewSchema.post('save', async function() {
  const Review = this.constructor
  const stats = await Review.aggregate([
    { $match: { vehicle: this.vehicle } },
    {
      $group: {
        _id: '$vehicle',
        rating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ])

  if (stats.length > 0) {
    await mongoose.model('Vehicle').findByIdAndUpdate(this.vehicle, {
      rating: Math.round(stats[0].rating * 10) / 10,
      reviewCount: stats[0].reviewCount
    })
  }
})

module.exports = mongoose.model('Review', reviewSchema)
