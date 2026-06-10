import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { CONTACT_INFO, SOCIAL_LINKS } from '../constants';
import { ContactForm } from '../types';

const Contact: React.FC = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Message envoyé avec succès !');
    reset();
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <section className="bg-brand-blue py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">Contactez-nous</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Une question ? Un besoin particulier ? Notre équipe est à votre écoute pour vous accompagner.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Contact Info */}
            <div className="w-full lg:w-1/3">
              <h2 className="text-3xl font-bold text-brand-blue mb-8">Informations de contact</h2>
              <div className="space-y-8 mb-12">
                <div className="flex gap-6 items-start">
                  <div className="bg-brand-green/10 p-4 rounded-xl text-brand-green">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand-blue mb-1">Téléphone</h4>
                    <p className="text-gray-600">{CONTACT_INFO.phone}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-brand-green/10 p-4 rounded-xl text-brand-green">
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand-blue mb-1">Email</h4>
                    <p className="text-gray-600">{CONTACT_INFO.email}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-brand-green/10 p-4 rounded-xl text-brand-green">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand-blue mb-1">Adresse</h4>
                    <p className="text-gray-600">{CONTACT_INFO.address}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-xl text-brand-blue mb-6">Suivez-nous</h4>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-green transition-all shadow-lg">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-green transition-all shadow-lg">
                  <Twitter size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-green transition-all shadow-lg">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-12 h-12 bg-brand-blue text-white rounded-xl flex items-center justify-center hover:bg-brand-green transition-all shadow-lg">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100">
                <h2 className="text-3xl font-bold text-brand-blue mb-8">Envoyez un message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-brand-blue uppercase tracking-wider">Nom complet</label>
                      <input
                        {...register('name', { required: 'Ce champ est requis' })}
                        className={`w-full bg-gray-50 border ${errors.name ? 'border-brand-red' : 'border-gray-200'} rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green transition-all`}
                        placeholder="Votre nom"
                      />
                      {errors.name && <span className="text-brand-red text-xs">{errors.name.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-brand-blue uppercase tracking-wider">Email</label>
                      <input
                        {...register('email', {
                          required: 'Ce champ est requis',
                          pattern: { value: /^\S+@\S+$/i, message: 'Email invalide' }
                        })}
                        className={`w-full bg-gray-50 border ${errors.email ? 'border-brand-red' : 'border-gray-200'} rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green transition-all`}
                        placeholder="votre@email.com"
                      />
                      {errors.email && <span className="text-brand-red text-xs">{errors.email.message}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-blue uppercase tracking-wider">Sujet</label>
                    <input
                      {...register('subject', { required: 'Ce champ est requis' })}
                      className={`w-full bg-gray-50 border ${errors.subject ? 'border-brand-red' : 'border-gray-200'} rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green transition-all`}
                      placeholder="Sujet de votre message"
                    />
                    {errors.subject && <span className="text-brand-red text-xs">{errors.subject.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-blue uppercase tracking-wider">Message</label>
                    <textarea
                      {...register('message', { required: 'Ce champ est requis' })}
                      rows={6}
                      className={`w-full bg-gray-50 border ${errors.message ? 'border-brand-red' : 'border-gray-200'} rounded-xl py-4 px-6 focus:outline-none focus:border-brand-green transition-all resize-none`}
                      placeholder="Comment pouvons-nous vous aider ?"
                    ></textarea>
                    {errors.message && <span className="text-brand-red text-xs">{errors.message.message}</span>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-green text-white py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-opacity-90 transition-all shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? 'Envoi...' : (
                      <>
                        Envoyer le message <Send size={20} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="text-brand-red mx-auto mb-4" />
            <p className="text-brand-blue font-bold">Localisation GPS (Google Maps Placeholder)</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
