
import React from 'react';

export const AdminFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
      <p>© DABA ERP {new Date().getFullYear()} - Version 1.0</p>
    </footer>
  );
};
