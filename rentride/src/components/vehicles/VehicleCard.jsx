import { Link } from 'react-router-dom'
import { HiOutlineStar, HiOutlineLocationMarker, HiOutlineUsers } from 'react-icons/hi'
import { MdElectricBolt } from 'react-icons/md'
import { getImageUrl } from '../../utils/imageUrl'

export default function VehicleCard({ vehicle }) {
  return (
    <Link to={`/vehicles/${vehicle._id}`} className="group card-hover flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-dark-800">
        <img
          src={getImageUrl(vehicle.images[0])}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 to-transparent" />

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="font-heading text-xs tracking-widest uppercase bg-dark-950/80 backdrop-blur-sm text-brand-400 px-3 py-1 border border-brand-500/30">
            {vehicle.type}
          </span>
        </div>

        {/* Availability */}
        <div className="absolute top-3 right-3">
          {vehicle.available
            ? <span className="badge-available">Available</span>
            : <span className="badge-unavailable">Booked</span>
          }
        </div>

        {/* Fuel type icon */}
        {vehicle.fuelType === 'Electric' && (
          <div className="absolute bottom-3 right-3 text-emerald-400">
            <MdElectricBolt className="text-xl drop-shadow" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-semibold text-white text-base leading-tight group-hover:text-brand-400 transition-colors">
            {vehicle.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <HiOutlineStar className="text-brand-400 text-sm" />
            <span className="font-heading text-sm text-dark-300">{vehicle.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-dark-400 text-xs mb-4">
          <div className="flex items-center gap-1">
            <HiOutlineLocationMarker className="text-brand-500/70" />
            <span className="font-body">{vehicle.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <HiOutlineUsers className="text-brand-500/70" />
            <span className="font-body">{vehicle.seats} seats</span>
          </div>
          <span className="font-heading uppercase text-xs tracking-wider text-dark-500">{vehicle.transmission}</span>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-dark-700 pt-4">
          <div>
            <span className="font-display text-2xl text-brand-400">₹{vehicle.pricePerDay.toLocaleString()}</span>
            <span className="text-dark-500 text-xs font-body"> / day</span>
          </div>
          <span className="text-dark-500 text-xs font-body">₹{vehicle.pricePerHour}/hr</span>
        </div>
      </div>
    </Link>
  )
}
