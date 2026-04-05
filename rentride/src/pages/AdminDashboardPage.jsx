import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineUserGroup, HiOutlineBookOpen, HiOutlineChartPie,
  HiOutlineLogout, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlinePencilAlt, HiOutlineTrash, HiOutlineTag, HiOutlineIdentification,
  HiOutlineExclamationCircle
} from 'react-icons/hi'
import { toast } from 'react-hot-toast'
import { MdDirectionsCar, MdBuild } from 'react-icons/md'
import { getImageUrl } from '../utils/imageUrl'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)



const statusConfig = {
  active: { label: 'Active', icon: HiOutlineClock, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  completed: { label: 'Completed', icon: HiOutlineCheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  upcoming: { label: 'Upcoming', icon: HiOutlineClock, color: 'text-brand-400 bg-brand-500/10 border-brand-500/30' },
  cancelled: { label: 'Cancelled', icon: HiOutlineXCircle, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  pending: { label: 'Pending', icon: HiOutlineClock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
}

const carStatusConfig = {
  available: { label: 'Available', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  rented: { label: 'Rented', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  maintenance: { label: 'Maintenance', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  'out-of-service': { label: 'Out of Service', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
}

const tabs = [
  { id: 'analytics', label: 'Analytics', icon: HiOutlineChartPie },
  { id: 'users', label: 'Users', icon: HiOutlineUserGroup },
  { id: 'bookings', label: 'All Bookings', icon: HiOutlineBookOpen },
  { id: 'cars', label: 'Cars Status', icon: MdDirectionsCar },
  { id: 'discounts', label: 'Discounts', icon: HiOutlineTag },
  { id: 'verification', label: 'Verification', icon: HiOutlineIdentification },
]

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('analytics')
  const [bookings, setBookings] = useState([])
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [coupons, setCoupons] = useState([])
  const [advAnalytics, setAdvAnalytics] = useState(null)
  const [couponForm, setCouponForm] = useState({ 
    code: '', discountType: 'percentage', discountAmount: 0, expiryDate: '', usageLimit: 100, minBookingAmount: 0 
  })

  // Maintenance State
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'Service', cost: 0, description: '', performedBy: ''
  })
  const [expiryForm, setExpiryForm] = useState({
    nextServiceDate: '', insuranceExpiry: '', pucExpiry: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      // First refresh vehicle statuses based on expiry dates
      await axios.post('/api/vehicles/refresh-status').catch(() => {}) // silent fail - non-critical
      
      const [bookingsRes, usersRes, vehiclesRes, couponsRes, analyticsRes] = await Promise.all([
        axios.get('/api/bookings'),
        axios.get('/api/users'),
        axios.get('/api/vehicles'),
        axios.get('/api/coupons'),
        axios.get('/api/bookings/admin/analytics')
      ])
      setBookings(bookingsRes.data.bookings || [])
      setUsers(usersRes.data.users || [])
      setVehicles(vehiclesRes.data.vehicles || [])
      setCoupons(couponsRes.data.coupons || [])
      setAdvAnalytics(analyticsRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch administrative data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.patch(`/api/bookings/${id}/status`, { status })
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status')
    }
  }

  const updateVehicleStatus = async (id, status) => {
    try {
      await axios.put(`/api/vehicles/${id}`, { status })
      await fetchData()
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle')
    }
  }

  const removeVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to permanently remove this vehicle from the fleet?')) return
    try {
      await axios.delete(`/api/vehicles/${id}`)
      await fetchData()
      toast.success('Vehicle removed from fleet')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle')
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/coupons', couponForm)
      await fetchData()
      toast.success('Coupon created successfully')
      setCouponForm({ code: '', discountType: 'percentage', discountAmount: 0, expiryDate: '', usageLimit: 100, minBookingAmount: 0 })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon')
    }
  }

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try {
      await axios.delete(`/api/coupons/${id}`)
      await fetchData()
      toast.success('Coupon deleted')
    } catch (err) {
      toast.error('Failed to delete coupon')
    }
  }

  const handleVerifyUser = async (id, status) => {
    try {
      await axios.patch(`/api/users/${id}/verify`, { status })
      await fetchData()
      toast.success(`User ${status}`)
    } catch (err) {
      toast.error('Failed to update verification status')
    }
  }

  const handleLogMaintenance = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`/api/vehicles/${selectedVehicle._id}/maintenance`, maintenanceForm)
      await fetchData()
      toast.success('Maintenance log added')
      setMaintenanceForm({ type: 'Service', cost: 0, description: '', performedBy: '' })
    } catch (err) {
      toast.error('Failed to add maintenance log')
    }
  }

  const handleUpdateExpiry = async (e) => {
    e.preventDefault()
    try {
      await axios.patch(`/api/vehicles/${selectedVehicle._id}/maintenance-status`, expiryForm)
      await fetchData()
      toast.success('Expiry dates updated')
    } catch (err) {
      toast.error('Failed to update expiry dates')
    }
  }

  const handleDownloadInvoice = async (bookingId, bookingNumber) => {
    const loadingToast = toast.loading('Generating invoice...')
    try {
      const { data } = await axios.get(`/api/bookings/${bookingId}/invoice`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Invoice-${bookingNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Invoice downloaded', { id: loadingToast })
    } catch (err) {
      toast.error('Failed to download invoice', { id: loadingToast })
    }
  }

  // Analytics Calculations
  const totalRevenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0)
  
  const activeBookings = bookings.filter(b => b.status === 'active').length
  const totalUsers = users.length
  const totalVehicles = vehicles.length

  // Chart Data (Mocking trend for now, but using real total)
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [120000, 190000, 150000, 250000, 220000, 300000, totalRevenue],
        fill: true,
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderColor: '#f97316',
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f97316',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        titleFont: { family: 'DM Sans', size: 14 },
        bodyFont: { family: 'DM Sans', size: 13 },
        padding: 12,
        borderColor: '#262626',
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#737373',
          font: { family: 'DM Sans', size: 12 },
          callback: (value) => '₹' + value.toLocaleString(),
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#737373', font: { family: 'DM Sans', size: 12 } },
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
          <p className="text-dark-400 font-heading tracking-widest uppercase text-sm">Initializing Command Center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 pt-24">
      <div className="bg-dark-900 border-b border-dark-800">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-14">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-brand-500 flex items-center justify-center text-white font-display text-4xl shadow-2xl shadow-brand-500/20">
              A
            </div>
            <div>
              <h1 className="font-display text-5xl text-white mb-2 leading-tight">ADMINISTRATOR</h1>
              <p className="text-dark-400 font-body text-lg">{user?.email} • <span className="text-brand-400">System Admin</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-900 border border-dark-800 overflow-hidden shadow-xl sticky top-32">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-8 py-6 text-left border-b border-dark-800 last:border-0 transition-all font-heading text-base tracking-widest uppercase ${
                    activeTab === tab.id
                      ? 'bg-brand-500/10 text-brand-400 border-l-4 border-l-brand-500 pl-10'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <tab.icon className="text-2xl" /> {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-4 px-8 py-6 text-red-500 hover:bg-red-500/5 transition-all font-heading text-base tracking-widest uppercase border-t border-dark-800"
              >
                <HiOutlineLogout className="text-2xl" /> Logout
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-4 translate-y-[-8px]">
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                <h2 className="font-display text-4xl text-white mb-10 tracking-tight">DASHBOARD ANALYTICS</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                  <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
                    <span className="text-dark-400 font-heading text-[10px] tracking-widest uppercase mb-3">Total Revenue</span>
                    <span className="font-display text-3xl text-brand-400 group-hover:scale-110 transition-transform">₹{totalRevenue.toLocaleString()}</span>
                    <span className="text-dark-500 text-[9px] uppercase mt-2">Completed trips</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
                    <span className="text-dark-400 font-heading text-[10px] tracking-widest uppercase mb-3">Fleet Utilization</span>
                    <span className="font-display text-3xl text-brand-400 group-hover:scale-110 transition-transform">{advAnalytics?.fleetUtilization || 0}%</span>
                    <span className="text-dark-500 text-[9px] uppercase mt-2">Cars booked/active</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
                    <span className="text-dark-400 font-heading text-[10px] tracking-widest uppercase mb-3">Available Fleet</span>
                    <span className="font-display text-3xl text-emerald-400 group-hover:scale-110 transition-transform">{advAnalytics?.availableFleet || 0}</span>
                    <span className="text-dark-500 text-[9px] uppercase mt-2">Ready for rent</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
                    <span className="text-dark-400 font-heading text-[10px] tracking-widest uppercase mb-3">Active Coupons</span>
                    <span className="font-display text-3xl text-white group-hover:scale-110 transition-transform">{coupons.filter(c => new Date(c.expiryDate) >= new Date()).length}</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-800 p-6 flex flex-col items-center text-center group hover:border-brand-500/50 transition-colors">
                    <span className="text-dark-400 font-heading text-[10px] tracking-widest uppercase mb-3 text-brand-400">Total Members</span>
                    <span className="font-display text-3xl text-white group-hover:scale-110 transition-transform">{totalUsers}</span>
                  </div>
                </div>
                
                <div className="space-y-12">
                  <div className="bg-dark-900 border border-dark-800 p-12">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="font-display text-2xl text-white">REVENUE TRENDS</h3>
                        <p className="text-dark-400 text-sm">Monthly earnings distribution</p>
                      </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <Line 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                          datasets: [{
                            label: 'Revenue',
                            data: Array(12).fill(0).map((_, i) => advAnalytics?.monthlyRevenue?.find(r => r._id === i + 1)?.total || 0),
                            borderColor: '#f97316',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            fill: true,
                            tension: 0.4
                          }]
                        }} 
                        options={chartOptions} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-dark-900 border border-dark-800 p-10">
                      <h3 className="font-display text-xl text-white mb-6 uppercase tracking-wider">Most Popular Vehicles</h3>
                      <div className="h-[300px] flex items-center justify-center">
                        <Doughnut 
                          data={{
                            labels: advAnalytics?.popularVehicles?.map(v => v.name) || [],
                            datasets: [{
                              data: advAnalytics?.popularVehicles?.map(v => v.count) || [],
                              backgroundColor: [
                                '#f97316',
                                '#0ea5e9',
                                '#8b5cf6',
                                '#ec4899',
                                '#10b981'
                              ],
                              borderColor: '#171717',
                              borderWidth: 2,
                              hoverOffset: 20
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                                labels: {
                                  color: '#737373',
                                  font: { family: 'DM Sans', size: 10 },
                                  padding: 20,
                                  usePointStyle: true
                                }
                              },
                              tooltip: {
                                backgroundColor: '#171717',
                                borderColor: '#262626',
                                borderWidth: 1,
                                padding: 12,
                                bodyFont: { family: 'DM Sans' }
                              }
                            },
                            cutout: '70%'
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-dark-900 border border-dark-800 p-10">
                      <h3 className="font-display text-xl text-white mb-6 uppercase tracking-wider">Peak Booking Times</h3>
                      <div className="h-[300px]">
                        <Line 
                          data={{
                            labels: Array(24).fill(0).map((_, i) => `${i}:00`),
                            datasets: [{
                              label: 'Volume',
                              data: Array(24).fill(0).map((_, i) => advAnalytics?.peakTimes?.find(t => t._id === i)?.count || 0),
                              borderColor: '#f97316',
                              backgroundColor: 'rgba(249, 115, 22, 0.1)',
                              fill: true,
                              tension: 0.4,
                              pointRadius: 0,
                              pointHoverRadius: 5,
                              pointHitRadius: 10,
                              pointBackgroundColor: '#f97316'
                            }]
                          }}
                          options={chartOptions}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Alerts */}
                  <div className="bg-dark-900 border border-dark-800 p-12">
                    <div className="flex items-center gap-3 mb-8">
                      <HiOutlineExclamationCircle className="text-3xl text-amber-500" />
                      <h3 className="font-display text-2xl text-white uppercase tracking-wider">Maintenance Alerts</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {(() => {
                        const now = new Date()
                        const fifteenDays = 15 * 24 * 60 * 60 * 1000
                        const sevenDays = 7 * 24 * 60 * 60 * 1000
                        const alertVehicles = vehicles.filter(v => {
                          const s = v.maintenanceStatus || {}
                          const insuranceDue = s.insuranceExpiry && (new Date(s.insuranceExpiry) - now) < fifteenDays
                          const pucDue = s.pucExpiry && (new Date(s.pucExpiry) - now) < fifteenDays
                          const serviceDue = s.nextServiceDate && (new Date(s.nextServiceDate) - now) < sevenDays
                          return insuranceDue || pucDue || serviceDue
                        })
                        if (alertVehicles.length === 0) return (
                          <div className="col-span-3 py-12 text-center bg-dark-950 border border-dark-800 border-dashed">
                            <p className="font-heading text-xs tracking-[0.2em] uppercase text-dark-500 italic">All vehicles are up to date with services and renewals.</p>
                          </div>
                        )
                        return alertVehicles.map(v => {
                          const s = v.maintenanceStatus || {}
                          const now2 = new Date()
                          const insExpiry = s.insuranceExpiry ? new Date(s.insuranceExpiry) : null
                          const pucExpiry = s.pucExpiry ? new Date(s.pucExpiry) : null
                          const svcDate = s.nextServiceDate ? new Date(s.nextServiceDate) : null
                          return (
                            <div key={v._id} className="bg-dark-950 border-l-4 border-amber-500 p-6 flex flex-col gap-2 group hover:bg-dark-800 transition-colors">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-white font-heading text-sm uppercase tracking-wider">{v.name}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase tracking-widest ${
                                  v.status === 'out-of-service' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                                  v.status === 'maintenance' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                                  'text-dark-400 border-dark-700'
                                }`}>{v.status}</span>
                              </div>
                              {insExpiry && (insExpiry - now2) < 15 * 24 * 60 * 60 * 1000 && (
                                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${insExpiry < now2 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-orange-300 bg-orange-500/10 border-orange-500/20'}`}>
                                  <div className="w-1 h-1 rounded-full animate-pulse bg-current" />
                                  Insurance {insExpiry < now2 ? 'EXPIRED' : 'Expiring Soon'}
                                </div>
                              )}
                              {pucExpiry && (pucExpiry - now2) < 15 * 24 * 60 * 60 * 1000 && (
                                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${pucExpiry < now2 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                                  <div className="w-1 h-1 rounded-full animate-pulse bg-current" />
                                  PUC {pucExpiry < now2 ? 'EXPIRED' : 'Renewal Due'}
                                </div>
                              )}
                              {svcDate && (svcDate - now2) < 7 * 24 * 60 * 60 * 1000 && (
                                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest px-2 py-1 border ${svcDate < now2 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-brand-400 bg-brand-500/10 border-brand-500/20'}`}>
                                  <div className="w-1 h-1 rounded-full animate-pulse bg-current" />
                                  Service {svcDate < now2 ? 'OVERDUE' : 'Due Soon'}
                                </div>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Discounts Tab */}
            {activeTab === 'discounts' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-display text-4xl text-white mb-10 tracking-tight">MANAGE DISCOUNTS</h2>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                  <div className="xl:col-span-1">
                    <form onSubmit={handleCreateCoupon} className="bg-dark-900 border border-dark-800 p-8 space-y-4 sticky top-32">
                      <h3 className="font-heading text-sm text-brand-400 uppercase tracking-widest mb-4">Create New Coupon</h3>
                      <div>
                        <label className="text-dark-400 text-[10px] uppercase tracking-widest mb-2 block">Promo Code</label>
                        <input required value={couponForm.code} onChange={e => setCouponForm(p => ({...p, code: e.target.value.toUpperCase()}))} placeholder="e.g. RENT10" className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-dark-400 text-[10px] uppercase tracking-widest mb-2 block">Type</label>
                          <select value={couponForm.discountType} onChange={e => setCouponForm(p => ({...p, discountType: e.target.value}))} className="input-field">
                            <option value="percentage">Percent %</option>
                            <option value="fixed">Fixed ₹</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-dark-400 text-[10px] uppercase tracking-widest mb-2 block">Amount</label>
                          <input type="number" value={couponForm.discountAmount} onChange={e => setCouponForm(p => ({...p, discountAmount: Number(e.target.value)}))} className="input-field" />
                        </div>
                      </div>
                      <div>
                        <label className="text-dark-400 text-[10px] uppercase tracking-widest mb-2 block">Expiry Date</label>
                        <input type="date" value={couponForm.expiryDate} onChange={e => setCouponForm(p => ({...p, expiryDate: e.target.value}))} className="input-field" />
                      </div>
                      <button type="submit" className="btn-primary w-full py-4 mt-4">Create Coupon</button>
                    </form>
                  </div>
                  <div className="xl:col-span-2 space-y-4">
                    {coupons.map(coupon => (
                      <div key={coupon._id} className="bg-dark-900 border border-dark-800 p-6 flex items-center justify-between group hover:border-brand-500/30 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-display text-xl tracking-tighter">
                            {coupon.code}
                          </div>
                          <div>
                            <div className="text-white font-heading text-sm mb-1">
                              {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} FLAT OFF`}
                            </div>
                            <div className="text-dark-500 text-[10px] uppercase tracking-widest font-body">
                              Used {coupon.usedCount}/{coupon.usageLimit} • Expires {new Date(coupon.expiryDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-dark-500 hover:text-red-500 transition-colors">
                          <HiOutlineTrash className="text-xl" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === 'verification' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-display text-4xl text-white mb-10 tracking-tight">IDENTITY VERIFICATION</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {users.filter(u => u.isVerified === 'pending').map(user => (
                    <div key={user._id} className="bg-dark-900 border border-dark-800 overflow-hidden">
                      <div className="aspect-video bg-dark-800 relative">
                        {user.drivingLicenseImage ? (
                          <img src={getImageUrl(user.drivingLicenseImage)} alt="License" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-dark-600 uppercase tracking-widest text-xs">No image uploaded</div>
                        )}
                        <div className="absolute top-4 left-4 font-heading text-[10px] tracking-[0.2em] uppercase bg-dark-950/80 text-white px-3 py-1">Document Preview</div>
                      </div>
                      <div className="p-8">
                        <h3 className="font-display text-2xl text-white mb-1 uppercase tracking-tight">{user.name}</h3>
                        <p className="text-dark-400 text-xs mb-6 font-body">{user.email} • License: <span className="text-brand-400 uppercase tracking-widest">{user.drivingLicense || 'NOT PROVIDED'}</span></p>
                        <div className="flex gap-4">
                          <button onClick={() => handleVerifyUser(user._id, 'verified')} className="btn-primary flex-1 py-3 text-xs tracking-widest uppercase">Approve</button>
                          <button onClick={() => handleVerifyUser(user._id, 'rejected')} className="btn-outline flex-1 py-3 text-xs tracking-widest uppercase text-red-400 border-red-500/30 hover:bg-red-500/10">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {users.filter(u => u.isVerified === 'pending').length === 0 && (
                    <div className="col-span-2 text-center py-32 bg-dark-900 border border-dark-800">
                      <div className="text-4xl mb-4">✅</div>
                      <p className="font-heading text-xs tracking-[0.25em] uppercase text-dark-500">Queue is empty. All users are current.</p>
                    </div>
                  )}
                </div>
              </div>
            )}


            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-display text-4xl text-white mb-10 tracking-tight">ALL USERS</h2>
                <div className="bg-dark-900 border border-dark-800 overflow-x-auto shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-800 bg-dark-950/50">
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Name</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Email</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Role</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Phone</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Registered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-dark-800/50 hover:bg-dark-800/50 transition-colors group">
                          <td className="p-6 text-white font-heading text-base tracking-wide">{u.name}</td>
                          <td className="p-6 text-dark-300 font-body text-sm group-hover:text-white transition-colors">{u.email}</td>
                          <td className="p-6">
                            <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 border ${u.role === 'admin' ? 'text-brand-400 border-brand-500/30 bg-brand-500/5' : 'text-dark-400 border-dark-700 bg-dark-800'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-6 text-dark-400 font-body text-sm">{u.phone || 'N/A'}</td>
                          <td className="p-6 text-dark-500 font-body text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-display text-4xl text-white mb-10 tracking-tight">SYSTEM BOOKINGS</h2>
                <div className="space-y-6">
                  {bookings.map(booking => {
                    const sc = statusConfig[booking.status] || statusConfig.upcoming
                    const vehicle = booking.vehicle || {}
                    const user = booking.user || {}
                    return (
                      <div key={booking._id} className="bg-dark-900 border border-dark-800 p-6 flex flex-col md:flex-row items-center gap-8 hover:border-brand-500/30 transition-all shadow-xl">
                        <div className="w-40 h-28 overflow-hidden border border-dark-700 flex-shrink-0">
                           <img src={getImageUrl(vehicle.images?.[0])} alt={vehicle.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-heading text-xl text-white tracking-wide">{vehicle.name}</span>
                            {booking.status === 'pending' ? (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                  className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[10px] tracking-widest uppercase hover:bg-emerald-500 hover:text-white transition-colors"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                  className="bg-red-500/20 text-red-100 border border-red-500/30 px-3 py-1 text-[10px] tracking-widest uppercase hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <select 
                                value={booking.status}
                                disabled={['cancelled', 'completed'].includes(booking.status)}
                                onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                                className={`bg-dark-950 border border-dark-700 text-[10px] tracking-widest uppercase px-3 py-1 outline-none transition-colors focus:border-brand-500 ${sc.color} ${['cancelled', 'completed'].includes(booking.status) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {['confirmed', 'active'].includes(booking.status) ? (
                                  <>
                                    <option value={booking.status}>{booking.status.toUpperCase()}</option>
                                    <option value="completed">COMPLETED</option>
                                    <option value="cancelled">CANCELLED</option>
                                  </>
                                ) : (
                                  Object.keys(statusConfig).map(s => (
                                    <option key={s} value={s}>{s.toUpperCase()}</option>
                                  ))
                                )}
                              </select>
                            )}
                          </div>
                          <p className="text-dark-400 text-sm font-body">Booked by <span className="text-white font-medium">{user.name}</span> ({user.email})</p>
                          <p className="text-dark-500 text-xs font-body mt-1">
                            {new Date(booking.pickupDate).toLocaleDateString()} — {new Date(booking.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-display text-3xl text-brand-400 mb-1">₹{booking.totalAmount.toLocaleString()}</div>
                          <div className="text-dark-500 text-[10px] font-body tracking-widest uppercase mb-3">ID: {booking.bookingId}</div>
                          <button 
                            onClick={() => handleDownloadInvoice(booking._id, booking.bookingId)}
                            className="text-dark-400 border border-dark-700 px-3 py-1 text-[10px] font-heading uppercase tracking-widest hover:bg-dark-800 hover:text-white transition-all"
                          >
                            Invoice
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cars Tab */}
            {activeTab === 'cars' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-display text-4xl text-white tracking-tight">FLEET STATUS</h2>
                  <Link to="/admin/vehicles/new" className="btn-primary text-xs py-3 px-8 flex items-center gap-3 tracking-widest font-heading shadow-2xl">
                    <MdDirectionsCar className="text-lg" /> ADD NEW VEHICLE
                  </Link>
                </div>
                <div className="bg-dark-900 border border-dark-800 overflow-x-auto shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-800 bg-dark-950/50">
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Vehicle</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Type</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">License Plate</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Status</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400">Actions</th>
                        <th className="p-6 font-heading text-sm tracking-widest uppercase text-dark-400 text-right">Price/Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map(car => {
                        const sc = carStatusConfig[car.status] || carStatusConfig.available
                        return (
                          <tr key={car._id} className="border-b border-dark-800/50 hover:bg-dark-800/50 transition-colors group">
                            <td className="p-6 text-white font-heading text-base">{car.name}</td>
                            <td className="p-6">
                              <span className="text-dark-400 text-[10px] border border-dark-700 px-2 py-0.5 uppercase tracking-widest">{car.type}</span>
                            </td>
                            <td className="p-6 text-dark-300 font-body text-sm tracking-widest uppercase">{car.plateNumber || 'N/A'}</td>
                            <td className="p-6">
                              <select 
                                value={car.status}
                                onChange={(e) => updateVehicleStatus(car._id, e.target.value)}
                                disabled={car.status === 'maintenance' || car.status === 'out-of-service'}
                                className={`bg-dark-950 border border-dark-700 text-[10px] px-3 py-1 tracking-widest uppercase focus:border-brand-500 outline-none transition-all ${sc.color} ${car.status === 'maintenance' || car.status === 'out-of-service' ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {Object.keys(carStatusConfig).map(s => (
                                  <option key={s} value={s}>{s.toUpperCase()}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                   <button 
                                     onClick={() => {
                                       setSelectedVehicle(car)
                                       setExpiryForm({
                                         nextServiceDate: car.maintenanceStatus?.nextServiceDate?.split('T')[0] || '',
                                         insuranceExpiry: car.maintenanceStatus?.insuranceExpiry?.split('T')[0] || '',
                                         pucExpiry: car.maintenanceStatus?.pucExpiry?.split('T')[0] || ''
                                       })
                                       setShowMaintenanceModal(true)
                                     }}
                                     className="p-2 bg-dark-800 text-dark-300 hover:text-brand-400 border border-dark-700 hover:border-brand-500/50 transition-all rounded shadow-lg"
                                     title="Maintenance Logs"
                                   >
                                     <MdBuild className="text-lg" />
                                   </button>
                                   <Link 
                                     to={`/admin/vehicles/edit/${car._id}`}
                                    className="p-2 bg-dark-800 text-dark-300 hover:text-brand-400 border border-dark-700 hover:border-brand-500/50 transition-all rounded shadow-lg"
                                    title="Edit Vehicle"
                                  >
                                    <HiOutlinePencilAlt className="text-lg" />
                                  </Link>
                                  <button 
                                    onClick={() => removeVehicle(car._id)}
                                    className="p-2 bg-dark-800 text-red-500 hover:bg-red-500 hover:text-white border border-dark-700 hover:border-red-500 transition-all rounded shadow-lg"
                                    title="Delete Vehicle"
                                  >
                                    <HiOutlineTrash className="text-lg" />
                                  </button>
                               </div>
                            </td>
                            <td className="p-6 text-right font-display text-xl text-brand-400">₹{car.pricePerDay.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-950/90 backdrop-blur-sm">
          <div className="bg-dark-900 border border-dark-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
              <div>
                <h3 className="font-display text-2xl text-white uppercase tracking-tight">{selectedVehicle.name}</h3>
                <p className="text-dark-500 text-[10px] uppercase tracking-widest">Fleet Maintenance & Logs</p>
              </div>
              <button onClick={() => setShowMaintenanceModal(false)} className="text-dark-400 hover:text-white transition-colors">
                <HiOutlineXCircle className="text-3xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Side: Expiry Dates */}
              <div className="space-y-8 text-white">
                <div>
                  <h4 className="font-heading text-xs text-brand-400 uppercase tracking-[0.2em] mb-6">Service & Expiry Status</h4>
                  <form onSubmit={handleUpdateExpiry} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Next Service Due</label>
                        <input type="date" value={expiryForm.nextServiceDate} onChange={e => setExpiryForm(p => ({...p, nextServiceDate: e.target.value}))} className="input-field" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Insurance Expiry</label>
                        <input type="date" value={expiryForm.insuranceExpiry} onChange={e => setExpiryForm(p => ({...p, insuranceExpiry: e.target.value}))} className="input-field" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">PUC Renewal Expiry</label>
                        <input type="date" value={expiryForm.pucExpiry} onChange={e => setExpiryForm(p => ({...p, pucExpiry: e.target.value}))} className="input-field" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 text-xs tracking-widest mt-2">Update Expiry Status</button>
                  </form>
                </div>

                <div>
                  <h4 className="font-heading text-xs text-brand-400 uppercase tracking-[0.2em] mb-6">Log New Activity</h4>
                  <form onSubmit={handleLogMaintenance} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Type</label>
                        <select value={maintenanceForm.type} onChange={e => setMaintenanceForm(p => ({...p, type: e.target.value}))} className="input-field">
                          <option value="Service">Scheduled Service</option>
                          <option value="Repair">General Repair</option>
                          <option value="Inspection">Inspection</option>
                          <option value="Insurance">Insurance Renewal</option>
                          <option value="PUC">PUC Check</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Cost (₹)</label>
                        <input type="number" value={maintenanceForm.cost} onChange={e => setMaintenanceForm(p => ({...p, cost: Number(e.target.value)}))} className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Work Performed By</label>
                      <input type="text" placeholder="e.g. Authorized Service Center" value={maintenanceForm.performedBy} onChange={e => setMaintenanceForm(p => ({...p, performedBy: e.target.value}))} className="input-field" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-dark-400 tracking-widest block mb-2">Description</label>
                      <textarea rows={2} value={maintenanceForm.description} onChange={e => setMaintenanceForm(p => ({...p, description: e.target.value}))} className="input-field resize-none" placeholder="Details of the task..."></textarea>
                    </div>
                    <button type="submit" className="btn-primary w-full py-3 text-xs tracking-widest mt-2 border border-brand-500/50 bg-transparent hover:bg-brand-500">Log Entry</button>
                  </form>
                </div>
              </div>

              {/* Right Side: History */}
              <div className="border-l border-dark-800 pl-12 overflow-y-auto max-h-[600px]">
                <h4 className="font-heading text-xs text-brand-400 uppercase tracking-[0.2em] mb-6">Maintenance History</h4>
                <div className="space-y-6">
                  {(selectedVehicle.maintenanceLogs || []).map((log, i) => (
                    <div key={i} className="bg-dark-950 border border-dark-800 p-5 space-y-2 relative">
                      <div className="flex justify-between items-start">
                        <span className="font-heading text-sm text-white uppercase tracking-widest font-bold">{log.type}</span>
                        <span className="text-emerald-400 font-display text-sm font-bold">₹{log.cost.toLocaleString()}</span>
                      </div>
                      <p className="text-dark-400 text-xs font-body leading-relaxed">{log.description}</p>
                      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-dark-600 pt-2">
                        <span>{log.performedBy || 'Unknown Source'}</span>
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!selectedVehicle.maintenanceLogs || selectedVehicle.maintenanceLogs.length === 0) && (
                    <div className="text-center py-20 text-dark-600 font-heading text-[10px] uppercase tracking-widest border border-dashed border-dark-800">No logs on record</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
