import React, { useState } from 'react';
import { useAuth } from '../../../core/context/AuthContext';
import { useTheme } from '../../../core/context/ThemeContext';
import { useToast, Modal } from '../../../core/ui/Feedback';
import { User, Shield, Key } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user?.name || user?.firstName || '');

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Génération dynamique de l'avatar
  const avatarInitials = (() => {
    const fullName = user?.name || user?.firstName || 'A';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  })();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSaving(true);
    
    try {
      // Simulation d'un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      if (user) {
        updateUser({
          ...user,
          name: name.trim(),
          firstName: name.trim().split(' ')[0], // fallback basique
          lastName: name.trim().split(' ').slice(1).join(' ') || '',
        });
      }
      
      toast.success('Profil mis à jour avec succès');
    } catch (err) {
      toast.error('Impossible de mettre à jour le profil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Le mot de passe est trop court (min 6 caractères)');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Simuler l'appel API (puisque l'API n'existe pas encore)
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast.success('Mot de passe mis à jour avec succès');
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Erreur lors de la modification du mot de passe');
    } finally {
      setIsSaving(false);
    }
  };

  const cardClasses = cn(
    'rounded-xl border shadow-sm p-6',
    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-surface-border'
  );
  
  const inputClasses = cn(
    'w-full px-4 py-2.5 rounded-lg border outline-none transition-colors',
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-brand-green/50'
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-green/50 focus:bg-white'
  );
  
  const inputReadonlyClasses = cn(
    'w-full px-4 py-2.5 rounded-lg border outline-none opacity-70 cursor-not-allowed',
    isDark
      ? 'bg-slate-800/50 border-slate-800 text-slate-300'
      : 'bg-gray-100 border-gray-200 text-gray-600'
  );
  
  const labelClasses = cn(
    'block text-sm font-semibold mb-2',
    isDark ? 'text-slate-300' : 'text-slate-700'
  );

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className={cardClasses}>
        <div className="flex items-center gap-3 mb-6">
          <User className={isDark ? 'text-brand-green' : 'text-brand-green'} size={24} />
          <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-brand-text')}>MON PROFIL</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Avatar */}
          <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 mb-8">
            <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg shrink-0">
              {avatarInitials}
            </div>
            <div className="flex flex-col justify-center text-center sm:text-left">
              <h3 className={cn('text-xl font-bold', isDark ? 'text-slate-100' : 'text-brand-text')}>
                {user?.name || user?.firstName || 'Administrateur'}
              </h3>
              <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Gérez vos informations personnelles.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Nom affiché</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClasses}
                placeholder="Votre nom complet"
                required
              />
            </div>
            
            <div>
              <label className={labelClasses}>Email</label>
              <input
                type="email"
                value={user?.email || 'admin@daba.local'}
                className={inputReadonlyClasses}
                readOnly
              />
            </div>
            
            <div>
              <label className={labelClasses}>Rôle</label>
              <input
                type="text"
                value={user?.roles?.[0] || 'Administrateur'}
                className={inputReadonlyClasses}
                readOnly
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={cn(
                'px-6 py-2.5 rounded-lg font-bold text-white transition-all',
                'bg-brand-green hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:active:scale-100',
              )}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      <div className={cardClasses}>
        <div className="flex items-center gap-3 mb-6">
          <Shield className={isDark ? 'text-brand-red' : 'text-brand-red'} size={24} />
          <h2 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-brand-text')}>SÉCURITÉ DU COMPTE</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
          <div>
            <h3 className={cn('font-bold', isDark ? 'text-slate-100' : 'text-brand-text')}>Mot de passe</h3>
            <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>••••••••••••</p>
          </div>
          <button
            onClick={() => setPasswordModalOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-colors',
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-surface-border text-slate-700 hover:bg-gray-100'
            )}
          >
            <Key size={16} />
            Modifier le mot de passe
          </button>
        </div>
      </div>

      <Modal
        open={passwordModalOpen}
        onClose={() => !isSaving && setPasswordModalOpen(false)}
        title="Modifier le mot de passe"
        size="sm"
      >
        <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelClasses}>Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <label className={labelClasses}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              disabled={isSaving}
              className={cn(
                'px-4 py-2 rounded-lg font-bold border transition-colors',
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-surface-border text-slate-700 hover:bg-gray-100'
              )}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-bold text-white bg-brand-green hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Modifier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
