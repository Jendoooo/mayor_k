'use client';

import Link from 'next/link';
import PublicNavbar from '@/app/components/PublicNavbar';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section style={{
        paddingTop: '120px',
        paddingBottom: '80px',
        textAlign: 'center',
        background: 'radial-gradient(circle at top center, #1e293b 0%, var(--color-bg-primary) 70%)',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 var(--space-lg)' }}>
          <div className="badge badge-maintenance mb-md">Welcome to Mayor K. Guest Palace</div>
          <h1 style={{
            fontSize: 'var(--text-4xl)',
            marginBottom: 'var(--space-lg)',
            lineHeight: 1.2,
            background: 'linear-gradient(to right, #fff, #94a3b8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Experience Comfort & Luxury in Epe
          </h1>
          <p className="text-secondary" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
            Whether you need a short rest to recharge or a relaxing overnight stay,
            Mayor K. Guest Palace offers premium hospitality tailored to your needs.
          </p>
          <div className="flex justify-center gap-md">
            <Link href="/book" className="btn btn-primary btn-lg">
              Book a Room
            </Link>
            <Link href="#rooms" className="btn btn-outline btn-lg">
              View Rates
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="amenities" style={{ padding: '80px 0', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-lg)' }}>
          <h2 className="text-center mb-xl">Why Choose Us</h2>
          <div className="grid grid-cols-3 gap-lg">
            {[
              { title: '24/7 Power', icon: '⚡', desc: 'Uninterrupted power supply with standby generators.' },
              { title: 'Secure Environment', icon: '🛡️', desc: 'Gated premises with 24-hour security personnel.' },
              { title: 'Premium Bar', icon: '🍷', desc: 'Fully stocked bar with exotic wines and spirits.' },
              { title: 'Short Rest', icon: '⏱️', desc: 'Flexible hourly rates for quick request.' },
              { title: 'Ample Parking', icon: '🚗', desc: 'Spacious and secure parking for all guests.' },
              { title: 'Smart TV', icon: '📺', desc: 'Entertainment systems in every room.' },
            ].map((feature, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: 'var(--space-md)' }}>{feature.icon}</div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-sm)' }}>{feature.title}</h3>
                <p className="text-secondary text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Showcase */}
      <section id="rooms" style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-lg)' }}>
          <h2 className="text-center mb-xl">Our Pricing</h2>
          <div className="grid grid-cols-3 gap-lg">
            {/* Standard */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: '#334155', marginBottom: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                {/* Image placeholder */}
                <div className="flex items-center justify-center h-full text-secondary">standard-room.jpg</div>
              </div>
              <h3 className="mb-xs">Standard Room</h3>
              <p className="text-secondary text-sm mb-lg">Perfect for solo travelers.</p>
              <div className="flex justify-between items-center border-t border-b py-md mb-md" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs text-secondary">Short Rest</div>
                  <div className="font-bold">₦5,000</div>
                </div>
                <div style={{ height: '20px', width: '1px', background: 'var(--color-border)' }}></div>
                <div>
                  <div className="text-xs text-secondary">Overnight</div>
                  <div className="font-bold">₦12,000</div>
                </div>
              </div>
              <Link href="/book?type=standard" className="btn btn-outline w-full">Select Room</Link>
            </div>

            {/* Deluxe */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden', borderColor: 'var(--color-primary)' }}>
              <div className="badge badge-approved" style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}>Popular</div>
              <div style={{ height: '200px', background: '#334155', marginBottom: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                {/* Image placeholder */}
                <div className="flex items-center justify-center h-full text-secondary">deluxe-room.jpg</div>
              </div>
              <h3 className="mb-xs">Deluxe Room</h3>
              <p className="text-secondary text-sm mb-lg">More space, more comfort.</p>
              <div className="flex justify-between items-center border-t border-b py-md mb-md" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs text-secondary">Short Rest</div>
                  <div className="font-bold">₦8,000</div>
                </div>
                <div style={{ height: '20px', width: '1px', background: 'var(--color-border)' }}></div>
                <div>
                  <div className="text-xs text-secondary">Overnight</div>
                  <div className="font-bold">₦18,000</div>
                </div>
              </div>
              <Link href="/book?type=deluxe" className="btn btn-primary w-full">Select Room</Link>
            </div>

            {/* VIP Suite */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ height: '200px', background: '#334155', marginBottom: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                {/* Image placeholder */}
                <div className="flex items-center justify-center h-full text-secondary">vip-suite.jpg</div>
              </div>
              <h3 className="mb-xs">VIP Suite</h3>
              <p className="text-secondary text-sm mb-lg">Ultimate luxury experience.</p>
              <div className="flex justify-between items-center border-t border-b py-md mb-md" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <div className="text-xs text-secondary">Short Rest</div>
                  <div className="font-bold">₦12,000</div>
                </div>
                <div style={{ height: '20px', width: '1px', background: 'var(--color-border)' }}></div>
                <div>
                  <div className="text-xs text-secondary">Overnight</div>
                  <div className="font-bold">₦30,000</div>
                </div>
              </div>
              <Link href="/book?type=vip" className="btn btn-outline w-full">Select Room</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 0', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-lg)', textAlign: 'center' }}>
          <div className="mb-lg">
            <h3 className="mb-sm">Mayor K. Guest Palace</h3>
            <p className="text-secondary">Epe, Lagos State</p>
          </div>
          <div className="flex justify-center gap-lg mb-lg">
            <Link href="/dashboard" className="text-sm text-muted hover:text-white">Staff Login</Link>
            <Link href="#contact" className="text-sm text-muted hover:text-white">Contact Us</Link>
            <Link href="#" className="text-sm text-muted hover:text-white">Privacy Policy</Link>
          </div>
          <p className="text-xs text-muted">© 2026 Mayor K. Guest Palace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
