import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="w-24 h-24 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-8xl font-black text-brand-blue mb-4">404</h1>
        <h2 className="text-3xl font-bold text-brand-text mb-6">Oups ! Page introuvable.</h2>
        <p className="text-gray-500 mb-10 text-lg">
          La page que vous recherchez semble avoir été déplacée ou n'existe plus.
        </p>
        <Link
          to="/"
          className="bg-brand-green text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl inline-flex"
        >
          <Home size={20} /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
