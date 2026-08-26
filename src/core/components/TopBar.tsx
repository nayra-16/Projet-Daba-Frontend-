import React from 'react';
import { Phone, Mail, Clock, Facebook } from 'lucide-react';
import { TikTok } from './TikTok';
import { CONTACT_INFO, SOCIAL_LINKS } from '../constants';

const TopBar: React.FC = () => {
  return (
    <div className="bg-brand-blue text-white py-2 w-full overflow-x-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 sm:gap-0 min-w-max sm:min-w-0">
        <div className="flex gap-4 sm:gap-6">
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
          <a href="https://www.facebook.com/share/1EatBLBLf9/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors cursor-pointer"><Facebook size={16} /></a>
          <a href="https://vm.tiktok.com/ZS9BrWa2Y5psg-IuyeK/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green transition-colors cursor-pointer"><TikTok size={16} /></a>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
