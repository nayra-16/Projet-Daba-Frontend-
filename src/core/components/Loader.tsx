import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-brand-blue font-bold text-xl animate-pulse">DABA</div>
      </div>
    </div>
  );
};

export default Loader;
