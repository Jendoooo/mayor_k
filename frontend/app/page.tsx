'use client';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import RoomHighlight from './components/RoomHighlight';
import { Wifi, Tv, Coffee, Wind, Battery, Car, Utensils, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-warm-white">
      <Navbar />

      <HeroSection />

      {/* Intro Section */}
      <section className="py-20 md:py-32 px-4 bg-white relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <span className="text-champagne-gold uppercase tracking-[0.2em] font-bold text-sm">Welcome to Royalty</span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-midnight-blue mt-6 mb-8 leading-tight">
            A Sanctuary of <br /> Unmatched Elegance
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed font-light">
            Nestled in the serene landscapes of Epe, Mayor K. Guest Palace redefines luxury with
            an infusion of traditional warmth. Whether you are here for a diplomatic retreat,
            a business engagement, or a family getaway, our bespoke services and world-class
            amenities ensure an unforgettable experience.
          </p>
          <div className="mt-12">
            <button className="border border-midnight-blue text-midnight-blue px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-midnight-blue hover:text-white transition-all duration-300">
              Discover Our Story
            </button>
          </div>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-champagne-gold/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-midnight-blue/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </section>

      <RoomHighlight />

      {/* Amenities Grid */}
      <section className="py-24 bg-bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <span className="text-champagne-gold uppercase tracking-widest text-sm font-bold">Amenities</span>
              <h2 className="font-serif text-4xl mt-3">Curated for You</h2>
            </div>
            <button className="text-champagne-gold hover:text-white transition-colors mt-4 md:mt-0 underline decoration-1 underline-offset-8">
              View All Facilities
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Wifi, title: "High-Speed WiFi", desc: "Seamless connectivity everywhere." },
              { icon: Battery, title: "24/7 Power", desc: "Uninterrupted comfort guaranteed." },
              { icon: Utensils, title: "Fine Dining", desc: "Local & Continental delicacies." },
              { icon: ShieldCheck, title: "Top Security", desc: "Your safety is our priority." },
              { icon: Car, title: "Ample Parking", desc: "Secure space for your vehicles." },
              { icon: Tv, title: "Smart Entertainment", desc: "DSTV & Netflix in every room." },
              { icon: Wind, title: "Climate Control", desc: "AC systems in all spaces." },
              { icon: Coffee, title: "Executive Lounge", desc: "Relax with premium drinks." },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-white/10 hover:border-champagne-gold/50 transition-colors group">
                <item.icon className="text-champagne-gold mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
                <h4 className="font-serif text-xl mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-midnight-blue border-t border-white/10 pt-20 pb-10 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <h3 className="font-serif text-2xl mb-6 text-white">Mayor K.</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                An oasis of luxury in Epe, Lagos. Experience the perfect blend of modern elegance and African hospitality.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-champagne-gold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Accommodations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dining</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Offers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-champagne-gold mb-6">Contact</h4>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li>123 Hospital Road, Epe, Lagos</li>
                <li>reservations@mayorkpalace.com</li>
                <li>+234 812 345 6789</li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-champagne-gold mb-6">Newsletter</h4>
              <p className="text-slate-400 text-sm mb-4">Subscribe for exclusive offers.</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="bg-white/5 border border-white/10 px-4 py-2 text-sm w-full focus:outline-none focus:border-champagne-gold transition-colors" />
                <button className="bg-champagne-gold px-4 py-2 text-white font-bold text-sm uppercase">Join</button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Mayor K. Guest Palace. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="/login" className="hover:text-champagne-gold transition-colors">Staff Access</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
