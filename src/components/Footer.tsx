import { Mail, Phone, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="/logo.png" 
                alt="AstroSkulture" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-xl font-bold">ASTROS KULTURE</span>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-2xl">
              Your go-to destination for premium streetwear and statement tees. We fuse comfort with attitude, delivering perfect fits, standout designs, and fabric quality that speaks for itself. Express your vibe, the Astros way.
            </p>
            <div className="flex items-center space-x-2">
              <a 
                href="https://www.instagram.com/astroskulture.in?igsh=Y2Z5MnluNzNpNDg2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <span className="text-sm text-gray-400">Follow us for latest designs and offers</span>
            </div>
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
                  <p className="text-xs text-gray-500 mt-1">For orders & support</p>
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
                  <p className="text-xs text-gray-500 mt-1">WhatsApp orders & queries</p>
                </div>
              </li>
              <li className="flex items-center space-x-2 pt-4">
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

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Astros Kulture, Wear your style, express your vibe ✨
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Wear the universe ✨
          </p>
        </div>
      </div>
    </footer>
  );
}