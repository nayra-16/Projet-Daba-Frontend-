import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { MENU_LINKS } from '../constants';
import { useCart } from '../context/CartContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBonPlanOpen, setIsBonPlanOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { getCartCount } = useCart();
  const location = useLocation();

  const bonPlanLinks = [
    { name: 'Actualité', path: '/actualites' },
    { name: "Appel d'offre", path: '/appels-offres' },
  ];

  const bonPlanActive =
    location.pathname === '/actualites' ||
    location.pathname === '/appels-offres' ||
    location.pathname.startsWith('/actualites/') ||
    location.pathname.startsWith('/appels-offres/');

  const servicesIndex = MENU_LINKS.findIndex((l) => l.name === 'Services');
  const menuBeforeBonPlan =
    servicesIndex === -1 ? MENU_LINKS : MENU_LINKS.slice(0, servicesIndex + 1);
  const menuAfterBonPlan = servicesIndex === -1 ? [] : MENU_LINKS.slice(servicesIndex + 1);

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
          {menuBeforeBonPlan.map((link) => (
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
          <div className="relative group">
            <button
              type="button"
              className={cn(
                'font-medium transition-colors hover:text-brand-green flex items-center gap-1',
                bonPlanActive ? 'text-brand-green' : 'text-brand-text'
              )}
            >
              Bon Plan
              <ChevronDown size={18} className="mt-[1px]" />
            </button>
            <div className="absolute left-0 top-full pt-3 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto transition-all duration-200">
              <div className="bg-white shadow-lg border rounded-md py-2 min-w-[200px]">
                {bonPlanLinks.map((sublink) => (
                  <NavLink
                    key={sublink.path}
                    to={sublink.path}
                    className={({ isActive }) =>
                      cn(
                        'block px-4 py-2 text-sm font-medium transition-colors hover:text-brand-green hover:bg-brand-light',
                        isActive ? 'text-brand-green' : 'text-brand-text'
                      )
                    }
                  >
                    {sublink.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          {menuAfterBonPlan.map((link) => (
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
          {menuBeforeBonPlan.map((link) => (
            <NavLink
              key={`${link.path}-${link.name}`}
              to={link.path}
              onClick={() => {
                setIsOpen(false);
                setIsBonPlanOpen(false);
              }}
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
          <button
            type="button"
            onClick={() => setIsBonPlanOpen((v) => !v)}
            className={cn(
              'font-medium text-lg transition-colors hover:text-brand-green flex items-center justify-between',
              bonPlanActive ? 'text-brand-green' : 'text-brand-text'
            )}
          >
            <span>Bon Plan</span>
            <ChevronDown
              size={22}
              className={cn('transition-transform', isBonPlanOpen && 'rotate-180')}
            />
          </button>
          {isBonPlanOpen && (
            <div className="flex flex-col gap-3 pl-4">
              {bonPlanLinks.map((sublink) => (
                <NavLink
                  key={sublink.path}
                  to={sublink.path}
                  onClick={() => {
                    setIsOpen(false);
                    setIsBonPlanOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'font-medium text-base transition-colors hover:text-brand-green',
                      isActive ? 'text-brand-green' : 'text-brand-text'
                    )
                  }
                >
                  {sublink.name}
                </NavLink>
              ))}
            </div>
          )}
          {menuAfterBonPlan.map((link) => (
            <NavLink
              key={`${link.path}-${link.name}`}
              to={link.path}
              onClick={() => {
                setIsOpen(false);
                setIsBonPlanOpen(false);
              }}
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
            onClick={() => {
              setIsOpen(false);
              setIsBonPlanOpen(false);
            }}
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
