import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, ChevronDown, LayoutDashboard, Wallet, Gift, Crown, Target, Bell, MessageSquare, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useNotificationStore from '../store/useNotificationStore';
import ConfirmModal from './ConfirmModal';
import { API_URL } from '../config';

const API = API_URL;

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'à l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [challenges, setChallenges] = useState(null);
  const [bellBounce, setBellBounce] = useState(false);
  const { userInfo, logout } = useAuthStore();
  const { cartItems } = useCartStore();
  const { counts, recentOrders, recentMessages, fetchNotifications, markSeen } = useNotificationStore();
  const isAdmin = userInfo?.role === 'admin';
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const prevCountRef = useRef(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!userInfo) { setChallenges(null); return; }
    const fetchChallenges = async () => {
      try {
        const { data } = await axios.get(`${API}/users/challenges`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setChallenges(data);
      } catch (err) { console.error(err); }
    };
    fetchChallenges();
    const interval = setInterval(fetchChallenges, 30000);
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    if (!isAdmin || !userInfo) return;
    fetchNotifications(userInfo.token);
    const interval = setInterval(() => {
      fetchNotifications(userInfo.token);
    }, 20000);
    return () => clearInterval(interval);
  }, [isAdmin, userInfo, fetchNotifications]);

  useEffect(() => {
    if (counts.totalUnread > prevCountRef.current && prevCountRef.current >= 0) {
      setBellBounce(true);
      setTimeout(() => setBellBounce(false), 1000);
    }
    prevCountRef.current = counts.totalUnread;
  }, [counts.totalUnread]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevShowNotifs = useRef(showNotifs);
  useEffect(() => {
    if (prevShowNotifs.current && !showNotifs && userInfo?.token) {
      markSeen(userInfo.token);
    }
    prevShowNotifs.current = showNotifs;
  }, [showNotifs, userInfo, markSeen]);

  const themeTextMuted = 'text-gray-700 font-medium text-sm';
  const themeBorder = 'border-gray-300';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 bg-white/95 backdrop-blur-md ${isScrolled ? 'py-3 shadow-md' : 'py-5'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
          <img src="/logo.png" alt="Atlas Kicks" className="h-14 w-auto" />
        </Link>

        {/* Desktop Links */}
        <div className={`hidden md:flex items-center gap-8 uppercase tracking-widest ${themeTextMuted}`}>
          <Link to={isAdmin ? "/admin" : "/"} className="transition-colors hover:text-green-600">{isAdmin ? 'Dashboard' : 'Accueil'}</Link>
          <Link to="/national-team" className="hover:text-red-500 transition-colors">Équipe Nationale</Link>
          <Link to="/botola" className="hover:text-green-600 transition-colors">Botola Pro</Link>
          {userInfo && !isAdmin && <Link to="/myorders" className="transition-colors hover:text-green-600">Mes Achats</Link>}
          {isAdmin ? (
            <Link to="/admin?tab=messages" className="transition-colors hover:text-green-600">Messages</Link>
          ) : (
            <Link to="/contact" className="transition-colors hover:text-green-600">Contact</Link>
          )}
          {isAdmin && <Link to="/admin?tab=users" className="transition-colors hover:text-green-600">Utilisateurs</Link>}
          {isAdmin && <Link to="/admin?tab=orders" className="transition-colors hover:text-green-600">Commandes</Link>}
        </div>

        {/* Icons */}
        <div className={`flex items-center gap-5 text-gray-700`}>
          {userInfo && (
            <div className="hidden sm:relative sm:flex">
              <button onClick={() => setShowWallet(!showWallet)} onBlur={() => setTimeout(() => setShowWallet(false), 200)} className="hover:text-green-600 transition-colors" title="Défis">
                <Wallet size={22} />
              </button>
              {showWallet && challenges && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-black uppercase tracking-tight text-sm text-gray-900">Mes Défis</p>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className={`p-3 rounded-lg border ${challenges.gift.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Gift size={16} className={challenges.gift.isActive ? 'text-green-600' : 'text-gray-400'} />
                          <span className="text-sm font-bold text-gray-800">Cadeau Gratuit</span>
                        </div>
                        {challenges.gift.eligible && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Débloqué</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                        <Target size={12} /> {challenges.gift.current}/{challenges.gift.target} produits
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${challenges.gift.eligible ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${challenges.gift.progress}%` }} />
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${challenges.vip.programActive ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Crown size={16} className={challenges.vip.programActive ? 'text-purple-600' : 'text-gray-400'} />
                          <span className="text-sm font-bold text-gray-800">VIP -{challenges.vip.discount}%</span>
                        </div>
                        {challenges.vip.isActive && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Actif</span>}
                      </div>
                      {challenges.vip.isActive ? (
                        <p className="text-xs text-purple-600 font-semibold">{challenges.vip.remainingDays} jour{challenges.vip.remainingDays > 1 ? 's' : ''} restant{challenges.vip.remainingDays > 1 ? 's' : ''}</p>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                          <Target size={12} /> {challenges.vip.current}/{challenges.vip.target} produits
                        </div>
                      )}
                      {!challenges.vip.isActive && (
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${challenges.vip.eligible ? 'bg-purple-500' : 'bg-amber-400'}`} style={{ width: `${challenges.vip.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border-t border-gray-100">
                    <Link to="/challenges" onClick={() => setShowWallet(false)} className="block text-center text-xs text-gray-500 hover:text-green-600 font-bold uppercase tracking-wider">
                      Voir les détails
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {userInfo ? (
            <div className="hidden sm:flex items-center gap-4 border-l ${themeBorder} pl-4 ml-2 relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} onBlur={() => setTimeout(() => setShowUserMenu(false), 200)} className="uppercase text-red-600 font-bold tracking-widest text-xs hover:opacity-80 transition-opacity flex items-center gap-1">
                {userInfo.name.split(' ')[0]} <ChevronDown size={14} />
              </button>
              {showUserMenu && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50">
                  {!isAdmin ? (
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                      <User size={16} /> Mon Profil
                    </Link>
                  ) : (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 transition-colors">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                  )}
                  <button onClick={() => { setShowUserMenu(false); setShowLogoutConfirm(true); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-800">
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <Link to="/login" className="transition-colors hidden sm:block hover:text-green-600">
              <User size={22} />
            </Link>
          )}

          {isAdmin ? (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifs(!showNotifs);
                }}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-amber-50 hover:text-amber-500 text-gray-600 transition-all duration-200"
                title="Notifications"
              >
                <motion.div
                  animate={bellBounce ? {
                    rotate: [0, 15, -15, 15, -15, 10, -10, 5, 0],
                    scale: [1, 1.2, 1.2, 1.2, 1.2, 1.1, 1.1, 1, 1],
                  } : {}}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                >
                  <Bell size={22} />
                </motion.div>
                {counts.totalUnread > 0 && (
                  <>
                    <motion.span
                      key={counts.totalUnread}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 shadow-lg"
                    >
                      {counts.totalUnread > 99 ? '99+' : counts.totalUnread}
                    </motion.span>
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-amber-500" />
                        <p className="font-black uppercase tracking-tight text-sm text-gray-900">Notifications</p>
                      </div>
                      {counts.totalUnread > 0 && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                          {counts.totalUnread} nouvelle{counts.totalUnread > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {counts.totalUnread === 0 && recentOrders.length === 0 && recentMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          <Bell size={32} className="mx-auto mb-2 opacity-30" />
                          Aucune notification
                        </div>
                      ) : (
                        <>
                          {recentMessages.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                  <MessageSquare size={12} /> Messages non lus ({counts.unreadMessages})
                                </p>
                              </div>
                              {recentMessages.map((msg) => (
                                <Link
                                  key={msg._id}
                                  to="/admin?tab=messages"
                                  onClick={() => setShowNotifs(false)}
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                >
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <MessageSquare size={14} className="text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{msg.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(msg.createdAt)}</p>
                                  </div>
                                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                                </Link>
                              ))}
                            </div>
                          )}

                          {recentOrders.length > 0 && (
                            <div>
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                                  <Package size={12} /> Commandes en attente ({counts.newOrders})
                                </p>
                              </div>
                              {recentOrders.map((order) => (
                                <Link
                                  key={order._id}
                                  to="/admin?tab=orders"
                                  onClick={() => setShowNotifs(false)}
                                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                >
                                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Package size={14} className="text-amber-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800">
                                      Commande #{order.orderNumber}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {order.user?.name || 'Client'} — {order.totalPrice?.toLocaleString()} MAD
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Clock size={10} className="text-gray-400" />
                                      <p className="text-[10px] text-gray-400">{timeAgo(order.createdAt)}</p>
                                      {!order.isPaid && (
                                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">Non payé</span>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        to="/admin?tab=orders"
                        onClick={() => setShowNotifs(false)}
                        className="text-xs text-gray-500 hover:text-green-600 font-bold uppercase tracking-wider"
                      >
                        Voir tout
                      </Link>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>{counts.totalOrders} cmd</span>
                        <span>{counts.totalProducts} prod</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/cart" data-cart-icon className="transition-colors relative flex items-center hover:text-green-600">
              <ShoppingBag size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className={`md:hidden block text-gray-800`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="md:hidden absolute top-full left-0 w-full border-t flex flex-col p-6 gap-6 border-t-gray-100 bg-white shadow-xl"
        >
          <Link to={isAdmin ? "/admin" : "/"} className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>{isAdmin ? 'Dashboard' : 'Accueil'}</Link>
          <Link to="/national-team" className="text-xl uppercase font-bold text-gray-800 hover:text-red-500" onClick={() => setMobileMenuOpen(false)}>Équipe Nationale</Link>
          <Link to="/botola" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Botola Pro</Link>
          {userInfo && !isAdmin && <Link to="/myorders" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Mes Achats</Link>}
          {isAdmin ? (
            <Link to="/admin?tab=messages" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
          ) : (
            <Link to="/contact" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          )}
          {isAdmin && <Link to="/admin?tab=users" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Utilisateurs</Link>}
          {isAdmin && <Link to="/admin?tab=orders" className="text-xl uppercase font-bold text-gray-800 hover:text-green-600" onClick={() => setMobileMenuOpen(false)}>Commandes</Link>}
          {isAdmin && (
            <Link to="/admin?tab=orders" className="text-xl uppercase font-bold text-amber-500 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Bell size={20} /> Notifications {counts.totalUnread > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{counts.totalUnread}</span>}
            </Link>
          )}
        </motion.div>
      )}
      <ConfirmModal
        show={showLogoutConfirm}
        title="Déconnexion"
        message="Voulez-vous vraiment vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        danger
        onConfirm={() => { setShowLogoutConfirm(false); handleLogout(); }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </nav>
  );
};

export default Navbar;
