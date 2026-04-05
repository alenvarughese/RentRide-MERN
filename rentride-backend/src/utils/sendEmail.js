const nodemailer = require('nodemailer')

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

/**
 * Wraps content in a branded RentRide HTML email template.
 * @param {string} content - Inner HTML content
 */
const wrapTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin: 0; padding: 0; background: #0d0d0d; font-family: 'DM Sans', Arial, sans-serif; color: #dee2e6; }
    .container { max-width: 600px; margin: 40px auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px; overflow: hidden; }
    .header { background: #111; padding: 28px 36px; border-bottom: 3px solid #f97316; }
    .logo { font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #fff; text-decoration: none; }
    .logo span { color: #f97316; }
    .body { padding: 36px; }
    h2 { color: #fff; font-size: 22px; margin: 0 0 16px 0; letter-spacing: 1px; }
    p { color: #adb5bd; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0; }
    .badge { display: inline-block; background: #f97316; color: #fff; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 2px; margin-bottom: 20px; }
    .detail-box { background: #111; border: 1px solid #2a2a2a; border-radius: 4px; padding: 20px 24px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a2a; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #6c757d; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
    .detail-value { color: #fff; font-size: 14px; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: #f97316; color: #fff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; margin: 20px 0; }
    .total { font-size: 24px; color: #f97316; font-weight: 900; }
    .footer { background: #111; padding: 20px 36px; text-align: center; color: #495057; font-size: 12px; border-top: 1px solid #2a2a2a; }
    .footer a { color: #f97316; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">RENT<span>RIDE</span></span>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} RentRide &mdash; Premium Car Rentals<br/>
      This is an automated email, please do not reply.
    </div>
  </div>
</body>
</html>
`

/**
 * Sends an email.
 * @param {object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter()
  const fromName = process.env.FROM_NAME || 'RentRide'
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html: wrapTemplate(html),
  }

  const info = await transporter.sendMail(mailOptions)
  console.log(`✉️  Email sent to ${to}: ${info.messageId}`)
  return info
}

// ─── Template Helpers ───────────────────────────────────────────────────────

sendEmail.welcomeTemplate = ({ name }) => `
  <div class="badge">Welcome</div>
  <h2>Welcome to RentRide, ${name}!</h2>
  <p>Your account has been successfully created. You can now explore our fleet and book your perfect ride.</p>
  <p>If you did not create this account, please contact our support immediately.</p>
  <p style="color:#f97316; font-weight:700; font-size:18px;">Start your journey →</p>
`

sendEmail.resetPasswordTemplate = ({ name, resetUrl }) => `
  <div class="badge">Password Reset</div>
  <h2>Reset Your Password</h2>
  <p>Hi <strong style="color:#fff">${name}</strong>,</p>
  <p>We received a request to reset the password for your RentRide account. Click the button below within <strong style="color:#f97316">15 minutes</strong>:</p>
  <a href="${resetUrl}" class="btn">Reset Password</a>
  <p>Or paste this link into your browser:</p>
  <p style="word-break:break-all; color:#6c757d; font-size:13px;">${resetUrl}</p>
  <p>If you did not request this, you can safely ignore this email. Your password will not change.</p>
`

sendEmail.bookingCreatedTemplate = ({ name, booking, vehicle }) => `
  <div class="badge">Booking Received</div>
  <h2>Your Booking is Confirmed!</h2>
  <p>Hi <strong style="color:#fff">${name}</strong>, we've received your booking request. Our team will verify availability and confirm shortly.</p>
  <div class="detail-box">
    <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">${booking.bookingId}</span></div>
    <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${vehicle.name}</span></div>
    <div class="detail-row"><span class="detail-label">Pickup Date</span><span class="detail-value">${new Date(booking.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${booking.pickupTime}</span></div>
    <div class="detail-row"><span class="detail-label">Return Date</span><span class="detail-value">${new Date(booking.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${booking.returnTime}</span></div>
    <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${booking.days} Day${booking.days > 1 ? 's' : ''}</span></div>
    <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value total">₹${booking.totalAmount.toLocaleString('en-IN')}</span></div>
  </div>
  <p>You will receive another email once the admin confirms your booking.</p>
`

sendEmail.bookingStatusTemplate = ({ name, booking, vehicle, status }) => {
  const statusText = {
    confirmed: { badge: 'Confirmed ✓', heading: 'Booking Confirmed!', message: 'Great news! Your booking has been confirmed by our team. Get ready for your ride!' },
    active: { badge: 'Active 🚗', heading: 'Your Rental is Now Active', message: 'Your rental period has begun. Enjoy the ride and drive safe!' },
    completed: { badge: 'Completed ✓', heading: 'Rental Completed', message: 'We hope you enjoyed your ride with RentRide! Your security deposit will be refunded within 5–7 business days.' },
    cancelled: { badge: 'Cancelled ✗', heading: 'Booking Cancelled', message: 'Your booking has been cancelled by admin. If you believe this is a mistake, please contact our support.' },
  }
  const info = statusText[status] || { badge: status.toUpperCase(), heading: `Booking Status: ${status}`, message: 'Your booking status has been updated.' }
  return `
    <div class="badge">${info.badge}</div>
    <h2>${info.heading}</h2>
    <p>Hi <strong style="color:#fff">${name}</strong>, ${info.message}</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">${booking.bookingId}</span></div>
      <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${vehicle.name}</span></div>
      <div class="detail-row"><span class="detail-label">Pickup</span><span class="detail-value">${new Date(booking.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
      <div class="detail-row"><span class="detail-label">Return</span><span class="detail-value">${new Date(booking.returnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color:#f97316; text-transform:uppercase">${status}</span></div>
    </div>
  `
}

sendEmail.bookingCancelledTemplate = ({ name, booking, vehicle, reason }) => `
  <div class="badge">Cancelled</div>
  <h2>Booking Cancelled</h2>
  <p>Hi <strong style="color:#fff">${name}</strong>, your booking has been cancelled as requested.</p>
  <div class="detail-box">
    <div class="detail-row"><span class="detail-label">Booking ID</span><span class="detail-value">${booking.bookingId}</span></div>
    <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${vehicle.name}</span></div>
    <div class="detail-row"><span class="detail-label">Cancelled On</span><span class="detail-value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
    ${reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reason}</span></div>` : ''}
  </div>
  <p>If your payment was processed, a refund (excluding taxes) will be initiated within 5–7 business days.</p>
`

module.exports = sendEmail
