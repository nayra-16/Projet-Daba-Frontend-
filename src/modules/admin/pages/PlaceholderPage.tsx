
import React from 'react';
import { useLocation } from 'react-router-dom';

export const PlaceholderPage: React.FC = () => {
  const location = useLocation();
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
      <h2 className="text-2xl font-bold text-brand-text mb-4">Page en construction</h2>
      <p className="text-gray-600 mb-2">Cette page ({location.pathname}) est actuellement en développement.</p>
      <p className="text-gray-500 text-sm">Revenez bientôt pour découvrir les nouvelles fonctionnalités !</p>
    </div>
  );
};
