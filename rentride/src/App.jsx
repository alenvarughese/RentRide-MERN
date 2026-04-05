import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import VehiclesPage from './pages/VehiclesPage'
import VehicleDetailPage from './pages/VehicleDetailPage'
import BookingPage from './pages/BookingPage'
import BookingConfirmPage from './pages/BookingConfirmPage'
import SuccessPage from './pages/SuccessPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import UserOnlyRoute from './components/auth/UserOnlyRoute'
import AdminDashboardPage from './pages/AdminDashboardPage'
import VehicleFormPage from './pages/VehicleFormPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#212529',
              color: '#dee2e6',
              border: '1px solid #f97316',
              borderRadius: '0',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public/User routes shielded from admin */}
            <Route element={<UserOnlyRoute />}>
              <Route index element={<HomePage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="booking/:id" element={<BookingPage />} />
                <Route path="booking/success" element={<SuccessPage />} />
                <Route path="booking/confirm/:bookingId" element={<BookingConfirmPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
              </Route>
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/vehicles/new" element={<VehicleFormPage />} />
              <Route path="admin/vehicles/edit/:id" element={<VehicleFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
