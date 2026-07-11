import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, Lock, User, MessageSquare, FileText, Clock, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { API_URL } from '../config';

const Contact = () => {
  const { userInfo } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erreur lors de l\'envoi');
      setSending(true);
      setTimeout(() => {
        setSending(false);
        setSubmitted(true);
      }, 5000);
    } catch (_) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'Soufianeaqli20@gmail.com', color: 'text-blue-400' },
    { icon: Phone, label: 'Téléphone', value: '+212 679224411', color: 'text-green-400' },
    { icon: MapPin, label: 'Adresse', value: 'Meknes, Maroc', color: 'text-red-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <span className="text-gold-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Restons en contact</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">Contactez-<span className="text-red-600">Nous</span></h1>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto">Une question, une suggestion ou un problème ? Notre équipe vous répondra dans les plus brefs délais.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Form Column */}
          <div className="lg:col-span-2">
            {sending ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <motion.div
                  animate={{ x: [0, 60, -60, 40, -40, 0], y: [0, -80, -40, -100, -60, 0], rotate: [0, 15, -15, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-8"
                >
                  <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center">
                    <Send size={40} className="text-gold-500" />
                  </div>
                </motion.div>
                <div className="flex items-center gap-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-3 h-3 rounded-full bg-gold-500"
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
                  ))}
                </div>
                <p className="text-gray-400 text-lg font-bold uppercase tracking-widest">Envoi en cours...</p>
                <p className="text-gray-600 text-sm mt-2">Votre message est en route</p>
              </motion.div>
            ) : submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-black/60 backdrop-blur-sm border border-green-500/20 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-black uppercase text-white mb-3">Message Envoyé !</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="bg-gold-500 text-black px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : !userInfo ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
                  <Lock size={40} className="text-gold-500" />
                </div>
                <h2 className="text-2xl font-black uppercase text-white mb-3">Connexion requise</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">Vous devez être connecté pour nous envoyer un message.</p>
                <Link to="/login"
                  className="inline-block bg-gold-500 text-black px-8 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  Se connecter
                </Link>
              </motion.div>
            ) : (
              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                      <User size={14} /> Nom complet
                    </label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required
                      className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="Votre nom complet" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                      <Mail size={14} /> Adresse email
                    </label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required
                      className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                      placeholder="votre@email.com" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                    <FileText size={14} /> Sujet
                  </label>
                  <input type="text" name="subject" value={form.subject} onChange={handleChange} required
                    className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Sujet de votre message" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                    <MessageSquare size={14} /> Message
                  </label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={6}
                    className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors resize-none"
                    placeholder="Décrivez votre demande en détail..." />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</motion.p>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02 }} whileTap={loading ? {} : { scale: 0.98 }}
                  className={`w-full py-3.5 rounded-lg uppercase font-black tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gold-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  }`}>
                  {loading ? 'Envoi...' : <><Send size={18} /> Envoyer le message</>}
                </motion.button>
              </motion.form>
            )}
          </div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
            className="space-y-6">
            {/* Contact Info */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-black uppercase tracking-wider mb-5 flex items-center gap-2">
                <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                Nos coordonnées
              </h3>
              <div className="space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className={`p-2 rounded-lg bg-white/5 ${info.color} group-hover:scale-110 transition-transform`}>
                      <info.icon size={18} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{info.label}</p>
                      <p className="text-white text-sm font-medium">{info.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-black uppercase tracking-wider mb-5 flex items-center gap-2">
                <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                Horaires
              </h3>
              <div className="space-y-3">
                {[
                  { day: 'Lundi - Vendredi', hours: '9h - 18h', active: true },
                  { day: 'Samedi', hours: '9h - 13h', active: true },
                  { day: 'Dimanche', hours: 'Fermé', active: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className={item.active ? 'text-green-500' : 'text-red-500'} />
                      <span className="text-gray-300 text-sm">{item.day}</span>
                    </div>
                    <span className={`text-sm font-bold ${item.active ? 'text-white' : 'text-gray-600'}`}>{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                Besoin d'aide ?
              </h3>
              <div className="space-y-2">
                {[
                  { to: '/faq', label: 'Questions fréquentes' },
                  { to: '/delivery-returns', label: 'Livraison & Retours' },
                  { to: '/order-tracking', label: 'Suivre ma commande' },
                ].map((link, i) => (
                  <Link key={i} to={link.to}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                    <span className="text-sm">{link.label}</span>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
