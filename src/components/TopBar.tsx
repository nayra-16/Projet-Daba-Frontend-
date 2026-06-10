import React from 'react';
import { Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { CONTACT_INFO, SOCIAL_LINKS } from '../constants';

const TopBar: React.FC = () => {
  return (
    <div className="bg-brand-blue text-white py-2 hidden md:block">
      <div className="container mx-auto px-4 flex justify-between items-center text-sm">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <Phone size={14} />
            <span>{CONTACT_INFO.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} />
            <span>{CONTACT_INFO.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>{CONTACT_INFO.hours}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-brand-green transition-colors"><Facebook size={16} /></a>
          <a href="#" className="hover:text-brand-green transition-colors"><Twitter size={16} /></a>
          <a href="#" className="hover:text-brand-green transition-colors"><Instagram size={16} /></a>
          <a href="#" className="hover:text-brand-green transition-colors"><Linkedin size={16} /></a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
