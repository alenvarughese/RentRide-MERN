# 🚗 RentRide — Vehicle Rental Platform (MERN Stack)

A full-stack vehicle rental platform built with MongoDB, Express.js, React (Vite + Tailwind CSS), and Node.js.

---

## 📁 Project Structure

```
rentride/                  ← React Frontend (Vite + Tailwind)
rentride-backend/          ← Node.js + Express API
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Frontend
cd rentride
npm install

# Backend
cd ../rentride-backend
npm install
```

### 2. Configure Backend

```bash
cd rentride-backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed the Database (optional)

```bash
cd rentride-backend
npm run seed
```

This creates:
- **Admin:** `admin@rentride.in` / `admin123`
- **Demo user:** `demo@rentride.in` / `demo123`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd rentride-backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd rentride
npm run dev
```

Then open: **http://localhost:5173**

---

## 🎨 Frontend Pages

| Route | Page |
|---|---|
| `/` | Home — Hero, Categories, Featured Fleet, Testimonials |
| `/vehicles` | Vehicle listing with filters & search |
| `/vehicles/:id` | Vehicle detail + booking widget |
| `/booking/:id` | 3-step booking flow (Dates → Add-ons → Payment) |
| `/booking/confirm/:id` | Booking confirmation |
| `/dashboard` | User dashboard — bookings, profile, settings |
| `/login` | Login page |
| `/register` | Registration page |
| `/about` | About RentRide |
| `/contact` | Contact form |

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get current user (protected) |

### Vehicles
| Method | Route | Description |
|---|---|---|
| GET | `/api/vehicles` | List vehicles (with filters) |
| GET | `/api/vehicles/:id` | Get single vehicle |
| POST | `/api/vehicles` | Create vehicle (admin) |
| PUT | `/api/vehicles/:id` | Update vehicle (admin) |
| DELETE | `/api/vehicles/:id` | Delete vehicle (admin) |

**Vehicle query params:** `type`, `transmission`, `fuel`, `available`, `minPrice`, `maxPrice`, `location`, `sort`, `q`, `page`, `limit`

### Bookings
| Method | Route | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking (protected) |
| GET | `/api/bookings/my` | My bookings (protected) |
| GET | `/api/bookings/:id` | Get booking by ID (protected) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking (protected) |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users/profile` | Get profile (protected) |
| PUT | `/api/users/profile` | Update profile (protected) |
| PUT | `/api/users/change-password` | Change password (protected) |
| GET | `/api/users` | All users (admin only) |
| DELETE | `/api/users/:id` | Delete user (admin only) |

---

## 🗄️ Database Models

### User
- name, email, phone, password (hashed)
- role: `user` | `admin`
- drivingLicense, address, isVerified

### Vehicle
- name, type, brand, model, year, color
- seats, transmission, fuelType
- pricePerDay, pricePerHour
- available, images[], features[]
- location, rating, reviewCount

### Booking
- user (ref), vehicle (ref)
- pickupDate, returnDate, pickupTime, returnTime
- days, vehicleCost, addonCost, taxes, deposit, totalAmount
- selectedAddons[], paymentMethod, paymentStatus
- status: `pending` | `confirmed` | `active` | `completed` | `cancelled`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3** — utility-first styling
- **React Router v6** — client-side routing
- **React Hot Toast** — notifications
- **React Icons** — icon library
- **Axios** — HTTP client
- **Framer Motion** — animations (optional)

### Backend
- **Node.js** + **Express 4**
- **MongoDB** + **Mongoose 8**
- **JWT** — authentication
- **bcryptjs** — password hashing
- **Morgan** — HTTP logging
- **CORS** — cross-origin support

---

## 🎨 Design System

- **Font Display:** Bebas Neue (headings, hero text)
- **Font Heading:** Barlow Condensed (labels, buttons, nav)
- **Font Body:** DM Sans (body text, forms)
- **Primary Color:** Orange `#f97316` (brand-500)
- **Background:** Near-black `#0d0f10` (dark-950)
- **Theme:** Dark industrial / automotive aesthetic

---

## 🔮 Future Enhancements

- [ ] Admin dashboard panel
- [ ] Vehicle owner portal (list your vehicle)
- [ ] Real payment gateway (Razorpay / Stripe)
- [ ] Email confirmations (Nodemailer)
- [ ] Image uploads (Cloudinary / AWS S3)
- [ ] Real-time availability calendar
- [ ] GPS vehicle tracking
- [ ] Review & rating system
- [ ] Push notifications
- [ ] Mobile app (React Native)

---

## 📄 License

MIT © 2025 RentRide
