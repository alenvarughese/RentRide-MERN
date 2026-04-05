import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Configure axios for production
const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
axios.defaults.baseURL = apiBase
console.log('🌐 RentRide API Base URL:', apiBase)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
