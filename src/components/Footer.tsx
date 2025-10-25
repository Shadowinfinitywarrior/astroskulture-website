import { Mail, Phone, MapPin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
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
              <span className="text-xl font-bold">ASTROSKULTURE</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Premium astronomy equipment and accessories for stargazers and professionals. 
              Explore the universe with quality telescopes and gear.
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
              <span className="text-sm text-gray-400">Follow us on Instagram</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/shop" className="hover:text-white transition-colors">Shop All Products</a></li>
              <li><a href="/telescopes" className="hover:text-white transition-colors">Telescopes</a></li>
              <li><a href="/binoculars" className="hover:text-white transition-colors">Binoculars</a></li>
              <li><a href="/accessories" className="hover:text-white transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-white transition-colors">Return Policy</a></li>
              <li><a href="/warranty" className="hover:text-white transition-colors">Warranty</a></li>
              <li><a href="/faqs" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contact Us</h3>
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
                  <p className="text-xs text-gray-500 mt-1">Mail Support</p>
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
                  <p className="text-xs text-gray-500 mt-1">WhatsApp/Call</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="leading-relaxed">
                    21c/144B North Kennedy St,<br />
                    MKP Nagar, Palaiyamkottai<br />
                    Tirunelveli 627002
                  </span>
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

        {/* Business Hours */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2 text-center">Business Hours</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 text-center">
            <div>
              <p className="font-medium">Mon - Fri</p>
              <p>9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="font-medium">Saturday</p>
              <p>10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="font-medium">Sunday</p>
              <p>Closed</p>
            </div>
            <div>
              <p className="font-medium">Support</p>
              <p>24/7 Email</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} AstroSkulture. All rights reserved. | 
            Premium Astronomy Equipment & Accessories
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Exploring the universe, one star at a time 🌌
          </p>
        </div>
      </div>
    </footer>
  );
}