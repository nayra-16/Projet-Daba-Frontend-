import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useAuth, User, UserRole } from '../../../core/context/AuthContext';
import { authService, LoginRequest, extractBackendErrorMessage } from '../../../core/services/authService';

interface LoginFormData {
  email: string;
  password: string;
}

function getDefaultRedirectRoute(user: User): string {
  const privileged: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'DIRECTEUR',
    'RESPONSABLE_ELEVAGE',
    'RESPONSABLE_PRODUCTION',
    'RESPONSABLE_STOCK',
    'RESPONSABLE_COMMERCIAL',
    'RESPONSABLE_ACHATS',
    'RESPONSABLE_RH',
    'RESPONSABLE_FINANCES',
    'EMPLOYE',
  ];
  if (user.roles.some((r) => privileged.includes(r))) {
    return '/admin/dashboard';
  }
  if (user.roles.includes('CUSTOMER')) {
    return '/';
  }
  return '/';
}

const Login: React.FC = () => {
  // Identifiants par défaut créés au démarrage par
  // com.oseor.daba.config.SecurityDataInitializer (utilisateur admin).
  // Le pré-remplissage permet d'éviter le HTTP 401 causé par la saisie
  // d'identifiants inexistants. Le backend reste l'autorité d'authentification.
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: 'admin@daba.local',
      password: 'Admin@123',
    },
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from = location.state?.from?.pathname;

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: LoginRequest = {
        email: data.email,
        password: data.password,
      };
      const authenticatedUser = await authService.login(payload);
      login(authenticatedUser);
      const destination = from ?? getDefaultRedirectRoute(authenticatedUser);
      navigate(destination, { replace: true });
    } catch (err) {
      const message = extractBackendErrorMessage(err);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
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

            {submitError && (
              <div className="text-sm text-brand-red bg-red-50 border border-red-100 rounded-xl p-3">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Connexion en cours...' : (<>Se connecter <LogIn size={20} /></>)}
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
