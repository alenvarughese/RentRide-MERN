import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'

const team = [
  { name: 'Alen Varughese', role: 'Founder & CEO', initials: 'AV' },
  { name: 'Sneha Joshi', role: 'Head of Operations', initials: 'SJ' },
  { name: 'Rahul Verma', role: 'CTO', initials: 'RV' },
  { name: 'Priya Nair', role: 'Customer Success Lead', initials: 'PN' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark-950 pt-20">
      {/* Hero */}
      <section className="relative py-24 bg-dark-900 overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-subtitle mb-4">Our Story</p>
          <h1 className="font-display text-7xl md:text-8xl text-white mb-8">ABOUT<br /><span className="text-brand-500">RENTRIDE</span></h1>
          <p className="text-dark-300 text-xl max-w-2xl leading-relaxed">
            We started with one simple belief: renting a vehicle should be as easy as calling a friend. No paperwork mountains, no hidden fees, no judgment. Just you, a vehicle, and the open road.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-subtitle mb-3">Our Mission</p>
              <h2 className="section-title mb-8">MOBILITY FOR<br />EVERYONE</h2>
              <p className="text-dark-300 leading-relaxed mb-6">
                Founded in 2022, RentRide set out to democratise vehicle access across India. Whether you're a solo traveller in the mountains, a family on a road trip, or a business moving cargo — we have the right vehicle at the right price.
              </p>
              <p className="text-dark-400 leading-relaxed">
                We partner with verified vehicle owners across 100+ cities, ensuring every rental meets our strict safety and quality standards. Every single booking is backed by comprehensive insurance.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '2022', label: 'Founded' },
                { value: '100+', label: 'Cities' },
                { value: '1,200+', label: 'Vehicles' },
                { value: '50K+', label: 'Happy Trips' },
              ].map((stat, i) => (
                <div key={i} className={`${i === 0 ? 'bg-brand-500' : 'bg-dark-900 border border-dark-700'} p-8 flex flex-col justify-end`}>
                  <div className={`font-display text-5xl ${i === 0 ? 'text-white' : 'text-brand-400'} mb-1`}>{stat.value}</div>
                  <div className={`font-heading text-xs uppercase tracking-widest ${i === 0 ? 'text-orange-200' : 'text-dark-400'}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-subtitle mb-3">What Drives Us</p>
            <h2 className="section-title">OUR VALUES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'Safety First', desc: 'Every vehicle undergoes rigorous checks. Every renter is covered. No exceptions.' },
              { icon: '💡', title: 'Transparency', desc: 'The price you see is the price you pay. No hidden charges, ever.' },
              { icon: '🤝', title: 'Community', desc: 'We support local vehicle owners and create opportunities across India.' },
              { icon: '🌱', title: 'Sustainability', desc: 'Growing our EV fleet to reduce emissions, one rental at a time.' },
            ].map(val => (
              <div key={val.title} className="bg-dark-800 border border-dark-700 p-8 hover:border-brand-500/50 transition-colors group">
                <div className="text-4xl mb-5">{val.icon}</div>
                <h3 className="font-heading font-semibold text-white tracking-wide text-lg mb-3 group-hover:text-brand-400 transition-colors">{val.title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-subtitle mb-3">The People</p>
            <h2 className="section-title">MEET THE<br />TEAM</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="group text-center">
                <div className="w-24 h-24 mx-auto bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4 group-hover:bg-brand-500/40 transition-colors">
                  <span className="font-display text-3xl text-brand-400">{member.initials}</span>
                </div>
                <h3 className="font-heading font-semibold text-white text-sm tracking-wide">{member.name}</h3>
                <p className="text-dark-500 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-6xl text-white mb-4">JOIN THE RIDE</h2>
          <p className="text-orange-100 text-lg mb-8">Ready to explore India on your own terms?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/vehicles" className="bg-white text-brand-600 font-heading font-bold tracking-widest uppercase px-10 py-4 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
              Browse Fleet <HiArrowRight />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white font-heading font-bold tracking-widest uppercase px-10 py-4 hover:bg-white/10 transition-colors">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
