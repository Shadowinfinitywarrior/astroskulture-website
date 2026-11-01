import { Mail, Phone, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="AstroSkulture" 
                className="w-10 h-10 object-contain"
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold">ASTROS KULTURE</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-xl">
              Your destination for heavyweight 240 GSM oversized streetwear and bespoke custom tees. We fuse urban comfort with attitude, delivering standout aesthetics that speak for themselves. Express your vibe, the Astros way.
            </p>
            <div className="flex items-center space-x-2">
              <a 
                href="https://www.instagram.com/astroskulture.in?igsh=Y2Z5MnluNzNpNDg2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <span className="text-sm text-gray-400">Follow us for latest drops and offers</span>
            </div>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Policies & Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Delivery
                </a>
              </li>
              <li>
                <a href="/return-refund-policy" className="hover:text-white transition-colors">
                  Returns & Refunds
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="mailto:help.astroskulture@gmail.com" 
                    className="hover:text-white transition-colors break-all"
                  >
                    help.astroskulture@gmail.com
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Orders & customer support</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <a 
                    href="tel:+917871658830" 
                    className="hover:text-white transition-colors"
                  >
                    +91 78716 58830
                  </a>
                  <p className="text-xs text-gray-400 mt-1">WhatsApp orders & queries</p>
                </div>
              </li>
              <li className="flex items-center space-x-2 pt-2">
                <Instagram className="w-4 h-4" />
                <a 
                  href="https://www.instagram.com/astroskulture.in?igsh=Y2Z5MnluNzNpNDg2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-sm"
                >
                  @astroskulture.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Astros Kulture. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <span>•</span>
            <a href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <span>•</span>
            <a href="/shipping-policy" className="text-gray-400 hover:text-white transition-colors">Shipping</a>
            <span>•</span>
            <a href="/return-refund-policy" className="text-gray-400 hover:text-white transition-colors">Returns</a>
          </div>
          <p className="font-bold tracking-wider text-gray-400">
            WEAR THE UNIVERSE ✨
          </p>
        </div>
      </div>
    </footer>
  );
}