import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const SuccessPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate('/')
        return
      }

      try {
        const { data } = await axios.get(`/api/payments/verify-session/${sessionId}`)
        if (data.success) {
          toast.success('Payment Successful!')
          navigate(`/booking/confirm/${data.bookingId}`)
        }
      } catch (err) {
        toast.error('Payment verification failed.')
        navigate('/vehicles')
      } finally {
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId, navigate])

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-brand-500/20 border border-brand-500/50 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-white text-2xl">
            ✓
          </div>
        </div>
        
        <h1 className="font-display text-4xl text-white tracking-tight">PAYMENT RECEIVED</h1>
        <p className="text-dark-400 font-heading text-sm tracking-widest uppercase leading-loose">
          We are finalizing your reservation details and syncing with our fleet management system.
        </p>

        <div className="flex items-center justify-center gap-3 py-4">
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
        </div>
        
        <p className="text-dark-600 text-[10px] font-heading tracking-[0.3em] uppercase">
          Please do not refresh or close this window
        </p>
      </div>
    </div>
  )
}

export default SuccessPage
