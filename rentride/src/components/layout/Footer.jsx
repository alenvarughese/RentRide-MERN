import { Link } from 'react-router-dom'
import { MdDirectionsCar } from 'react-icons/md'
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi'
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* CTA Strip */}
      <div className="bg-brand-500 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading font-semibold tracking-widest uppercase text-white text-lg">
            Ready to hit the road? Book your vehicle today.
          </p>
          <Link to="/vehicles" className="bg-white text-brand-600 font-heading font-bold tracking-widest uppercase px-6 py-2 text-sm hover:bg-dark-100 transition-colors whitespace-nowrap">
            Browse Fleet
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 flex items-center justify-center">
                <MdDirectionsCar className="text-white text-xl" />
              </div>
              <span className="font-display text-2xl text-white tracking-widest">
                RENT<span className="text-brand-500">RIDE</span>
              </span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Your premier vehicle rental platform. Cars, bikes, trucks, boats — we have it all. Drive anything, go anywhere.
            </p>
            <div className="flex items-center gap-3">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-dark-700 flex items-center justify-center text-dark-400 hover:border-brand-500 hover:text-brand-400 transition-colors">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold tracking-widest uppercase text-white text-sm mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/vehicles', label: 'Browse Vehicles' },
                { to: '/vehicles?type=car', label: 'Cars' },
                { to: '/vehicles?type=bike', label: 'Bikes & Scooters' },
                { to: '/vehicles?type=truck', label: 'Trucks & SUVs' },
                { to: '/vehicles?type=boat', label: 'Boats' },
                { to: '/about', label: 'About Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-dark-400 hover:text-brand-400 text-sm transition-colors font-body flex items-center gap-2 group">
                    <span className="w-3 h-px bg-dark-600 group-hover:bg-brand-500 transition-colors group-hover:w-4"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold tracking-widest uppercase text-white text-sm mb-5">Support</h4>
            <ul className="space-y-3">
              {[
                { to: '/faq', label: 'FAQ' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/terms', label: 'Terms & Conditions' },
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/insurance', label: 'Insurance Info' },
                { to: '/contact', label: 'Contact Support' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-dark-400 hover:text-brand-400 text-sm transition-colors font-body flex items-center gap-2 group">
                    <span className="w-3 h-px bg-dark-600 group-hover:bg-brand-500 transition-colors group-hover:w-4"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold tracking-widest uppercase text-white text-sm mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <HiOutlineLocationMarker className="text-brand-500 text-lg flex-shrink-0 mt-0.5" />
                <span>123 Fleet Street, Mumbai, Maharashtra, India 400001</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiOutlinePhone className="text-brand-500 text-lg flex-shrink-0" />
                <a href="tel:+911234567890" className="hover:text-brand-400 transition-colors">+91 12345 67890</a>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <HiOutlineMail className="text-brand-500 text-lg flex-shrink-0" />
                <a href="mailto:hello@rentride.in" className="hover:text-brand-400 transition-colors">hello@rentride.in</a>
              </li>
            </ul>
            <div className="mt-6 bg-dark-900 border border-dark-700 p-4">
              <p className="text-xs text-dark-400 font-heading uppercase tracking-wider mb-1">Support Hours</p>
              <p className="text-white text-sm">Mon – Sat: 8am – 8pm</p>
              <p className="text-dark-400 text-xs">24/7 Emergency Line Available</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-dark-800 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs font-body">
            © 2025 RentRide. All rights reserved.
          </p>
          <p className="text-dark-600 text-xs font-body">
            Built with ❤️ for explorers everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
