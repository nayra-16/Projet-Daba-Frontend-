import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth, User, UserRole } from '../../../core/context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the location the user was trying to access before login
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const onSubmit = (data: LoginFormData) => {
    console.log('Login attempt:', data);
    
    // Simulate login - replace with actual API call later
    // For now, we'll create a mock user
    const mockUser: User = {
      id: '1',
      name: 'Admin User',
      email: data.email,
      role: 'ADMIN' as UserRole,
    };

    login(mockUser);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center mb-6">
              <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
              <span className="ml-2 text-3xl font-bold text-brand-blue">DABA</span>
            </Link>
            <h2 className="text-2xl font-bold text-brand-blue">Espace Client</h2>
            <p className="text-gray-500 mt-2">Connectez-vous pour suivre vos commandes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <input
                  {...register('email', { required: 'Requis' })}
                  type="email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-6 focus:outline-none focus:border-brand-green"
                  placeholder="votre@email.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Mot de passe</label>
                <a href="#" className="text-xs text-brand-green font-bold hover:underline">Oublié ?</a>
              </div>
              <div className="relative">
                <input
                  {...register('password', { required: 'Requis' })}
                  type="password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-6 focus:outline-none focus:border-brand-green"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl"
            >
              Se connecter <LogIn size={20} />
            </button>

            <p className="text-center text-gray-500 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/contact" className="text-brand-green font-bold hover:underline">Contactez-nous</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
