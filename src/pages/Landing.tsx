import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Truck,
  Warehouse,
  Users,
  ShoppingCart,
  BarChart3,
  Mail,
  MapPin,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

const FEATURES = [
  {
    icon: Leaf,
    title: 'Produce Listings',
    desc: 'Farmers list harvests with quality grades, pricing, and location across all 30 districts.',
  },
  {
    icon: ShoppingCart,
    title: 'Digital Marketplace',
    desc: 'Buyers discover produce, filter by crop and district, and place orders in seconds.',
  },
  {
    icon: Truck,
    title: 'Logistics Coordination',
    desc: 'Transport providers accept dispatch requests with live tracking from farm to hub.',
  },
  {
    icon: Warehouse,
    title: 'Storage Booking',
    desc: 'Storage facilities manage capacity; farmers book cold and dry storage when needed.',
  },
  {
    icon: Users,
    title: 'Cooperative Tools',
    desc: 'Cooperatives aggregate member produce and manage bulk orders for better market access.',
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics',
    desc: 'Platform operators verify accounts, audit transactions, and run AI-powered system reports.',
  },
];

const STEPS = [
  { step: '01', title: 'Register', desc: 'Create your account and complete your profile with district and role.' },
  { step: '02', title: 'List or Browse', desc: 'Farmers list produce; buyers search the marketplace by crop and location.' },
  { step: '03', title: 'Order & Dispatch', desc: 'Place orders, accept requests, and coordinate transport across districts.' },
  { step: '04', title: 'Deliver & Settle', desc: 'Track deliveries, confirm completion, and settle commission automatically.' },
];

const TESTIMONIALS = [
  {
    quote: 'Mavuno helped our cooperative in Musanze reach buyers in Kigali without middlemen taking half the margin.',
    name: 'Jeanine Uwase',
    role: 'Cooperative Lead, Kinigi',
  },
  {
    quote: 'I can see exactly where my maize shipment is and when it will arrive. No more phone calls at midnight.',
    name: 'Emmanuel Nshimiyimana',
    role: 'Buyer, Kigali City',
  },
  {
    quote: 'Listing my coffee harvest took five minutes. The transport request was accepted the same day.',
    name: 'Claudine Mukamana',
    role: 'Farmer, Nyamagabe',
  },
];

export default function Landing() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const nextTestimonial = () =>
    setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
  const prevTestimonial = () =>
    setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-[#ece7e4]/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-serif text-2xl font-bold text-primary">Mavuno</span>
          <nav className="hidden sm:flex items-center gap-8 font-sans text-sm font-semibold text-on-surface-variant">
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.signIn}
              className="font-sans text-sm font-bold text-primary hover:text-secondary transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              to={ROUTES.signUp}
              className="bg-primary text-white font-sans text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden imigongo-pattern">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="font-sans text-sm font-bold text-secondary uppercase tracking-widest mb-4">
              Connect. Harvest. Thrive.
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-primary leading-tight">
              Rwanda&apos;s climate-smart agricultural coordination platform
            </h1>
            <p className="font-sans text-lg text-on-surface-variant mt-6 leading-relaxed">
              Connect farmers, cooperatives, buyers, transport providers, and storage facilities
              in one digital ecosystem — reducing post-harvest losses and improving market access.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                to={ROUTES.signUp}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-sans font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={ROUTES.signIn}
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-xl font-sans font-bold hover:bg-primary/5 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 imigongo-border" />
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl font-bold text-primary">About Mavuno</h2>
            <p className="font-sans text-on-surface-variant mt-4 leading-relaxed">
              Built by SaibaX Hub Ltd, Mavuno models a central coordination platform for Rwanda&apos;s
              full agricultural value chain. Smallholder farmers depend on reliable movement of bulk
              crops between farms, washing stations, cooperatives, and hubs — yet coordination today
              is fragmented across spreadsheets and phone calls.
            </p>
            <p className="font-sans text-on-surface-variant mt-4 leading-relaxed">
              Mavuno brings produce listings, orders, logistics, storage, and financial settlement
              into a single trusted platform spanning all 30 districts.
            </p>
          </div>
          <div className="bg-surface-low rounded-3xl p-8 border border-[#ece7e4]">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-secondary" />
              <span className="font-sans font-bold text-primary">30 Districts Connected</span>
            </div>
            <div className="space-y-4 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Target farmers (Year 1)</span>
                <span className="font-bold text-primary">500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Target buyers</span>
                <span className="font-bold text-primary">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Successful transactions</span>
                <span className="font-bold text-primary">1,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-brand-bg">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-primary text-center">Platform Features</h2>
          <p className="font-sans text-on-surface-variant text-center mt-3 max-w-xl mx-auto">
            Everything you need to coordinate produce from harvest to delivery.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl p-6 border border-[#ece7e4] hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-primary">{feature.title}</h3>
                  <p className="font-sans text-sm text-on-surface-variant mt-2 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-primary text-center">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {STEPS.map((item) => (
              <div key={item.step} className="relative text-center p-6">
                <span className="font-serif text-5xl font-bold text-primary/15">{item.step}</span>
                <h3 className="font-serif text-lg font-bold text-primary mt-2">{item.title}</h3>
                <p className="font-sans text-sm text-on-surface-variant mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface-low">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-primary">What Our Users Say</h2>
          <div className="mt-10 relative">
            <blockquote className="font-serif text-xl text-primary leading-relaxed italic">
              &ldquo;{TESTIMONIALS[testimonialIndex].quote}&rdquo;
            </blockquote>
            <p className="font-sans font-bold text-on-surface mt-6">
              {TESTIMONIALS[testimonialIndex].name}
            </p>
            <p className="font-sans text-sm text-on-surface-variant">
              {TESTIMONIALS[testimonialIndex].role}
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-[#ece7e4] hover:bg-white transition-colors cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </button>
              <button
                type="button"
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-[#ece7e4] hover:bg-white transition-colors cursor-pointer"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-brand-bg">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-primary text-center">Contact Us</h2>
          <p className="font-sans text-on-surface-variant text-center mt-3">
            Questions about pilot programmes or partnerships? Reach out to SaibaX Hub Ltd.
          </p>
          {contactSent ? (
            <div className="mt-8 bg-primary/10 text-primary rounded-2xl p-6 text-center font-sans font-semibold">
              Thank you! We will respond within 2 business days.
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Your name"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#ece7e4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="email"
                placeholder="Email address"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#ece7e4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                placeholder="Your message"
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#ece7e4] bg-white font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-sans font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#ece7e4] py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-serif text-xl font-bold text-primary">Mavuno</span>
            <p className="font-sans text-xs text-on-surface-variant mt-1">
              &copy; {new Date().getFullYear()} SaibaX Hub Ltd. All rights reserved.
            </p>
          </div>
          <p className="font-sans text-sm text-on-surface-variant">Connect. Harvest. Thrive.</p>
        </div>
      </footer>
    </div>
  );
}
