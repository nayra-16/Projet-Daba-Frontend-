import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { CONTACT_INFO, MENU_LINKS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-blue text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Brand */}
          <div>
            <Link to="/" className="flex items-center mb-6">
              <img 
                src="/src/assets/logos/logo.png" 
                alt="DABA Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  // Fallback if image doesn't exist yet
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-lg">
                D
              </div>
              <span className="ml-2 text-2xl font-bold">DABA</span>
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Des produits d’élevage frais, sains et de qualité pour tous. DABA accompagne les particuliers et les professionnels avec excellence.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-green transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-green transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-green transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-green transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 inline-block">Explore</h3>
            <ul className="space-y-4">
              {MENU_LINKS.map((link) => (
                <li key={`${link.path}-${link.name}`}>
                  <Link to={link.path} className="text-gray-300 hover:text-brand-green transition-colors flex items-center gap-2">
                    <span className="text-brand-green">›</span> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 inline-block">Contact</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-brand-green mt-1 flex-shrink-0" />
                <span>{CONTACT_INFO.phone}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-brand-green mt-1 flex-shrink-0" />
                <span>{CONTACT_INFO.email}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-green mt-1 flex-shrink-0" />
                <span>{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter/CTA */}
          <div>
            <h3 className="text-xl font-bold mb-6 border-b border-white/20 pb-2 inline-block">Newsletter</h3>
            <p className="text-gray-300 mb-4">Abonnez-vous pour recevoir nos offres.</p>
            <div className="relative">
              <input
                type="email"
                placeholder="Votre email"
                className="w-full bg-white/10 border border-white/20 rounded-md py-3 px-4 pr-12 text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-green"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green p-2 rounded-md hover:bg-opacity-90 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} DABA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
