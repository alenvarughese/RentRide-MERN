import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="font-display text-[160px] md:text-[220px] leading-none text-dark-800 select-none">404</div>
        <div className="-mt-10 relative z-10">
          <p className="section-subtitle mb-3">Page Not Found</p>
          <h1 className="font-display text-5xl text-white mb-4">WRONG TURN</h1>
          <p className="text-dark-400 mb-8 max-w-sm mx-auto">
            Looks like you took a wrong turn. The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary flex items-center justify-center gap-2">
              Back to Home <HiArrowRight />
            </Link>
            <Link to="/vehicles" className="btn-outline flex items-center justify-center gap-2">
              Browse Fleet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
