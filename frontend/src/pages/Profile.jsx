import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import ConfirmModal from '../components/ConfirmModal';
import { User, Save, Crown, Clock, Mail, Lock, Shield, Calendar, CheckCircle, AlertTriangle, Eye, EyeOff, ChevronRight, Package } from 'lucide-react';
import { API_URL } from '../config';

const API = API_URL;

const Profile = () => {
  const { userInfo, setUserInfo } = useAuthStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('info');
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [vipStatus, setVipStatus] = useState(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    const fetchVip = async () => {
      if (!userInfo) return;
      try {
        const { data } = await axios.get(`${API}/vip/me`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setVipStatus(data);
        if (data.isVip && data.remainingDays > 0) {
          const dismissed = sessionStorage.getItem('vip-congrats-dismissed');
          if (!dismissed) setShowCongrats(true);
        }
      } catch (err) { console.error(err); }
    };
    const fetchStats = async () => {
      if (!userInfo) return;
      try {
        const { data } = await axios.get(`${API}/orders/myorders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setOrderCount(data.length);
        setTotalSpent(data.reduce((s, o) => s + (o.totalPrice || 0), 0));
      } catch (_) {}
    };
    fetchVip();
    fetchStats();
  }, [userInfo]);

  if (!userInfo) { navigate('/login'); return null; }

  const initials = userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const memberSince = userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('fr-MA', { year: 'numeric', month: 'long' }) : 'N/A';

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/users/profile`, { name, email }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setUserInfo(data);
      setMessage('Profil mis à jour avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!currentPassword) { setError('Veuillez entrer votre mot de passe actuel'); return; }
    if (!newPassword) { setError('Veuillez entrer un nouveau mot de passe'); return; }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (newPassword.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setSaving(true);
    try {
      await axios.put(`${API}/users/profile`, { name: userInfo.name, email: userInfo.email, currentPassword, password: newPassword }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setMessage('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <AnimatePresence>
        {showCongrats && vipStatus?.isVip && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-gradient-to-br from-purple-900 to-amber-900 border border-yellow-500/30 rounded-2xl p-8 w-full max-w-md text-center">
              <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-3">Membre VIP Atlas</h2>
              <p className="text-yellow-300 font-bold text-lg mb-2">Félicitations !</p>
              <p className="text-gray-200 mb-6">Vous êtes désormais membre VIP Atlas. Profitez de {vipStatus.config?.discountPercent || 15}% de réduction sur tous les produits pendant {vipStatus.remainingDays} jours.</p>
              <button onClick={() => { setShowCongrats(false); sessionStorage.setItem('vip-congrats-dismissed', 'true'); }}
                className="px-8 py-3 bg-yellow-400 text-black font-black uppercase tracking-widest hover:bg-white transition-colors rounded-lg">
                Génial !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-black text-2xl font-black flex-shrink-0 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              {initials}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-black uppercase tracking-tight mb-1">{userInfo.name}</h1>
              <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-1">
                <Mail size={14} /> {userInfo.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-gray-300">
                  <Shield size={12} /> {userInfo.role === 'admin' ? 'Administrateur' : 'Membre'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-gray-300">
                  <Calendar size={12} /> Membre depuis {memberSince}
                </span>
                {vipStatus?.isVip && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Crown size={12} /> VIP ({vipStatus.remainingDays}j)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-black text-gold-500">{orderCount}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Commandes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gold-500">{totalSpent.toLocaleString('fr-MA')} <span className="text-sm">MAD</span></p>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Total dépensé</p>
            </div>
          </div>
        </motion.div>

        {/* VIP Banner */}
        {vipStatus?.isVip && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Crown size={24} className="text-yellow-400" />
              <div className="flex-1">
                <p className="font-bold text-yellow-400 uppercase tracking-wider text-sm">Membre VIP Atlas</p>
                <p className="text-green-400 text-xs font-bold">{vipStatus.config?.discountPercent || 15}% de réduction active</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock size={14} />
                <span>{vipStatus.remainingDays}j restant{vipStatus.remainingDays !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-black/40 border border-white/10 rounded-xl p-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMessage(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                  : 'text-gray-500 hover:text-white'
              }`}>
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div key="success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              <p className="text-green-400 text-sm font-medium">{message}</p>
            </motion.div>
          )}
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.form key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }} onSubmit={handleInfoSubmit}
              className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  <User size={14} /> Nom complet
                </label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Votre nom complet" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  <Mail size={14} /> Adresse email
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="votre@email.com" />
              </div>
              <motion.button type="submit" disabled={saving}
                whileHover={saving ? {} : { scale: 1.02 }} whileTap={saving ? {} : { scale: 0.98 }}
                className={`w-full py-3.5 rounded-lg uppercase font-black tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  saving ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gold-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                }`}>
                <Save size={18} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </motion.button>
            </motion.form>
          )}

          {activeTab === 'security' && (
            <motion.form key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }} onSubmit={handlePasswordSubmit}
              className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  <Lock size={14} /> Mot de passe actuel
                </label>
                <div className="relative">
                  <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                    className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Entrez votre mot de passe actuel" />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  <Lock size={14} /> Nouveau mot de passe
                </label>
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Minimum 6 caractères" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2 uppercase tracking-wider font-bold">
                  <Lock size={14} /> Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input type={showConfirmPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#090a0c] border border-gray-700 text-white px-4 py-3 pr-12 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
                    placeholder="Retapez le mot de passe" />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-2">Les mots de passe ne correspondent pas</p>
                )}
                {newPassword && newPassword.length < 6 && (
                  <p className="text-amber-400 text-xs mt-2">Minimum 6 caractères requis</p>
                )}
              </div>
              <motion.button type="submit" disabled={saving}
                whileHover={saving ? {} : { scale: 1.02 }} whileTap={saving ? {} : { scale: 0.98 }}
                className={`w-full py-3.5 rounded-lg uppercase font-black tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  saving ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gold-500 text-black hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                }`}>
                <Lock size={18} /> {saving ? 'Modification...' : 'Modifier le mot de passe'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Profile;
