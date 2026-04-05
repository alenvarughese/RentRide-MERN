const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

dotenv.config()
connectDB()

const app = express()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/vehicles', require('./routes/vehicles'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/users', require('./routes/users'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/reviews', require('./routes/reviews'))
app.use('/api/coupons', require('./routes/coupons'))

// Root route
app.get('/', (req, res) => res.send('🚀 RentRide API is running...'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 RentRide server running on port ${PORT}`))
