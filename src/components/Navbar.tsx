import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { MENU_LINKS } from '../constants';
import { useCart } from '../context/CartContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'w-full z-50 transition-all duration-300',
        isSticky ? 'fixed top-0 bg-white shadow-md py-4' : 'relative bg-white py-6'
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img 
            src="/src/assets/logos/logo.png" 
            alt="DABA Logo" 
            className="w-[70px] h-[70px] md:w-[90px] lg:w-[110px] object-contain"
            onError={(e) => {
              // Fallback if image doesn't exist yet
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-[70px] h-[70px] md:w-[90px] lg:w-[110px] bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-2xl">
            D
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {MENU_LINKS.map((link) => (
            <NavLink
              key={`${link.path}-${link.name}`}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  'font-medium transition-colors hover:text-brand-green',
                  isActive ? 'text-brand-green' : 'text-brand-text'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden lg:flex items-center gap-6">
          <Link to="/cart" className="relative text-brand-blue hover:text-brand-green transition-colors">
            <ShoppingCart size={24} />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          <Link
            to="/products"
            className="bg-brand-red text-white px-6 py-2 rounded-md font-bold hover:bg-opacity-90 transition-all"
          >
            Commander
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <Link to="/cart" className="relative text-brand-blue">
            <ShoppingCart size={24} />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="text-brand-blue">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t py-4 px-4 flex flex-col gap-4 animate-fadeIn">
          {MENU_LINKS.map((link) => (
            <NavLink
              key={`${link.path}-${link.name}`}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  'font-medium text-lg transition-colors hover:text-brand-green',
                  isActive ? 'text-brand-green' : 'text-brand-text'
                )
              }
            >
              {link.name}
            </NavLink>
          ))}
          <Link
            to="/products"
            onClick={() => setIsOpen(false)}
            className="bg-brand-red text-white px-6 py-3 rounded-md font-bold text-center"
          >
            Commander
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
