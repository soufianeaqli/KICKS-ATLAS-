import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/useAuthStore';
import axios from 'axios';
import { MessageSquare, Search, Mail, MailOpen, ChevronDown, ChevronUp, Trash2, Users, Shield, UserX, ShoppingCart, Package, CheckCircle, Star, Gift, Crown, Settings, Eye, EyeOff, Plus, X, Edit } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const API = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) return {};
  return { Authorization: `Bearer ${JSON.parse(info).token}` };
};

const AdminDashboard = () => {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const section = !tab || !['dashboard','users','orders','messages','reviews','gifts','promotion','vip'].includes(tab) ? 'dashboard' : tab;
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ products: 0, contacts: 0, orders: 0, revenue: 0 });
  const [contactSearch, setContactSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [expandedContact, setExpandedContact] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [confirmDeleteContact, setConfirmDeleteContact] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [confirmDeleteReview, setConfirmDeleteReview] = useState(null);

  const [giftProducts, setGiftProducts] = useState([]);
  const [giftForm, setGiftForm] = useState({ name: '', image: '', description: '' });
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [confirmDeleteGift, setConfirmDeleteGift] = useState(null);

  const [promoConfig, setPromoConfig] = useState(null);

  const [vipMembers, setVipMembers] = useState([]);
  const [vipConfig, setVipConfig] = useState(null);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') navigate('/login');
  }, [userInfo, navigate]);

  const fetchContacts = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/contact`, { headers: getAuthHeaders() }); setContacts(data); } catch (err) { console.error(err); }
  }, []);

  const fetchUsers = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/users`, { headers: getAuthHeaders() }); setUsers(data); } catch (err) { console.error(err); }
  }, []);

  const fetchOrders = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/orders`, { headers: getAuthHeaders() }); setOrders(data); } catch (err) { console.error(err); }
  }, []);

  const fetchReviews = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/reviews/all`, { headers: getAuthHeaders() }); setReviews(data); } catch (err) { console.error(err); }
  }, []);

  const fetchGifts = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/gifts/products/all`, { headers: getAuthHeaders() }); setGiftProducts(data); } catch (err) { console.error(err); }
  }, []);

  const fetchPromoConfig = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/gifts/config`); setPromoConfig(data); } catch (err) { console.error(err); }
  }, []);

  const fetchVipData = useCallback(async () => {
    try { const { data } = await axios.get(`${API}/vip/members`, { headers: getAuthHeaders() }); setVipMembers(data.members || []); setVipConfig(data.config); } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { if (section === 'users') fetchUsers(); }, [section, fetchUsers]);
  useEffect(() => { if (section === 'orders') fetchOrders(); }, [section, fetchOrders]);
  useEffect(() => { if (section === 'reviews') fetchReviews(); }, [section, fetchReviews]);
  useEffect(() => { if (section === 'gifts') { fetchGifts(); fetchPromoConfig(); } }, [section, fetchGifts, fetchPromoConfig]);
  useEffect(() => { if (section === 'vip') fetchVipData(); }, [section, fetchVipData]);

  useEffect(() => {
    if (section === 'dashboard') { fetchContacts(); fetchOrders(); }
  }, [section, fetchOrders, fetchContacts]);

  useEffect(() => {
    if (section === 'dashboard') {
      const loadStats = async () => {
        try {
          const headers = getAuthHeaders();
          const [prodRes, contactRes, orderRes] = await Promise.all([
            axios.get(`${API}/products?all=true`),
            axios.get(`${API}/contact`, { headers }),
            axios.get(`${API}/orders`, { headers }),
          ]);
          setStats({
            products: prodRes.data.products?.length || 0,
            contacts: contactRes.data?.length || 0,
            orders: orderRes.data?.length || 0,
            revenue: orderRes.data?.reduce((sum, o) => sum + (o.totalPrice || 0), 0) || 0,
          });
        } catch (err) { console.error(err); }
      };
      loadStats();
    }
  }, [section]);

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.subject?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.message?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o.orderNumber?.toString().includes(orderSearch) ||
    o._id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.trackingNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredReviews = reviews.filter(r =>
    r._id?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.user?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.comment?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(reviewSearch.toLowerCase())
  );

  const markAsRead = async (id) => {
    try { await axios.put(`${API}/contact/${id}`, {}, { headers: getAuthHeaders() }); setContacts(prev => prev.map(c => c._id === id ? { ...c, read: true } : c)); } catch (err) { console.error(err); }
  };

  const deleteContact = async () => {
    if (!confirmDeleteContact) return;
    try { await axios.delete(`${API}/contact/${confirmDeleteContact}`, { headers: getAuthHeaders() }); setContacts(prev => prev.filter(c => c._id !== confirmDeleteContact)); setConfirmDeleteContact(null); } catch (err) { console.error(err); }
  };

  const deleteUser = async () => {
    if (!confirmDeleteUser) return;
    try { await axios.delete(`${API}/users/${confirmDeleteUser}`, { headers: getAuthHeaders() }); setUsers(prev => prev.filter(u => u._id !== confirmDeleteUser)); setConfirmDeleteUser(null); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const deleteOrder = async () => {
    if (!confirmDeleteOrder) return;
    try { await axios.delete(`${API}/orders/${confirmDeleteOrder}`, { headers: getAuthHeaders() }); setOrders(prev => prev.filter(o => o._id !== confirmDeleteOrder)); setConfirmDeleteOrder(null); } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const markDelivered = async (id) => {
    try { await axios.put(`${API}/orders/${id}/deliver`, {}, { headers: getAuthHeaders() }); setOrders(prev => prev.map(o => o._id === id ? { ...o, isDelivered: true, deliveredAt: new Date(), status: 'delivered' } : o)); } catch (err) { console.error(err); }
  };

  const markPaid = async (id) => {
    try { await axios.put(`${API}/orders/${id}/pay`, {}, { headers: getAuthHeaders() }); setOrders(prev => prev.map(o => o._id === id ? { ...o, isPaid: true, paidAt: new Date() } : o)); } catch (err) { console.error(err); }
  };

  const updateOrderStatus = async (id, status) => {
    try { await axios.put(`${API}/orders/${id}/status`, { status }, { headers: getAuthHeaders() }); setOrders(prev => prev.map(o => o._id === id ? { ...o, status, isDelivered: status === 'delivered' ? true : o.isDelivered, deliveredAt: status === 'delivered' ? new Date() : o.deliveredAt, isPaid: status === 'shipped' && !o.isPaid ? true : o.isPaid, paidAt: status === 'shipped' && !o.isPaid ? new Date() : o.paidAt } : o)); } catch (err) { console.error(err); }
  };

  const toggleReviewApproval = async (id, field) => {
    const review = reviews.find(r => r._id === id);
    if (!review) return;
    try {
      const { data } = await axios.put(`${API}/reviews/${id}`, { [field]: !review[field] }, { headers: getAuthHeaders() });
      setReviews(prev => prev.map(r => r._id === id ? { ...r, ...data } : r));
    } catch (err) { console.error(err); }
  };

  const deleteReview = async () => {
    if (!confirmDeleteReview) return;
    try { await axios.delete(`${API}/reviews/${confirmDeleteReview}`, { headers: getAuthHeaders() }); setReviews(prev => prev.filter(r => r._id !== confirmDeleteReview)); setConfirmDeleteReview(null); } catch (err) { console.error(err); }
  };

  const handleGiftSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGift) {
        const { data } = await axios.put(`${API}/gifts/products/${editingGift._id}`, giftForm, { headers: getAuthHeaders() });
        setGiftProducts(prev => prev.map(g => g._id === editingGift._id ? data : g));
      } else {
        const { data } = await axios.post(`${API}/gifts/products`, giftForm, { headers: getAuthHeaders() });
        setGiftProducts(prev => [...prev, data]);
      }
      setGiftForm({ name: '', image: '', description: '' });
      setShowGiftForm(false);
      setEditingGift(null);
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const deleteGift = async () => {
    if (!confirmDeleteGift) return;
    try { await axios.delete(`${API}/gifts/products/${confirmDeleteGift}`, { headers: getAuthHeaders() }); setGiftProducts(prev => prev.filter(g => g._id !== confirmDeleteGift)); setConfirmDeleteGift(null); } catch (err) { console.error(err); }
  };

  const updatePromoConfig = async (updates) => {
    try { const { data } = await axios.put(`${API}/gifts/config`, updates, { headers: getAuthHeaders() }); setPromoConfig(data); } catch (err) { console.error(err); }
  };

  const updateVipConfig = async (updates) => {
    try { const { data } = await axios.put(`${API}/vip/config`, updates, { headers: getAuthHeaders() }); setVipConfig(data); } catch (err) { console.error(err); }
  };

  const editGift = (gift) => {
    setGiftForm({ name: gift.name, image: gift.image, description: gift.description || '' });
    setEditingGift(gift);
    setShowGiftForm(true);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!userInfo || userInfo.role !== 'admin') return null;

  const statusBadge = (s) => {
    const map = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    return map[s] || 'bg-white/5 text-gray-400 border-white/10';
  };

  const statusLabel = (s) => {
    const map = { pending: 'En attente', confirmed: 'Confirmée', processing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée' };
    return map[s] || s || 'Inconnu';
  };

  return (
    <div className="pt-20 min-h-screen text-white">

      <main className="min-h-[calc(100vh-5rem)] overflow-x-hidden">
        <div className="p-6">

          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/10 border border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Produits</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.products}</p>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-xl">
                      <Package size={24} className="text-purple-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-600/20 to-amber-900/10 border border-amber-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-300 text-sm font-medium">Commandes</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.orders}</p>
                    </div>
                    <div className="bg-amber-500/20 p-3 rounded-xl">
                      <ShoppingCart size={24} className="text-amber-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Messages</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.contacts}</p>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-xl">
                      <MessageSquare size={24} className="text-blue-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-600/20 to-green-900/10 border border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">Revenu</p>
                      <p className="text-3xl font-bold text-white mt-1">{stats.revenue.toLocaleString()} MAD</p>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded-xl">
                      <Package size={24} className="text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl">
                <div className="p-6 border-b border-gray-800/50">
                  <h3 className="text-lg font-semibold">Activité récente</h3>
                  <p className="text-gray-400 text-sm mt-1">Les {Math.min(orders.length, 5)} dernières commandes</p>
                </div>
                <div className="divide-y divide-gray-800/50">
                  {orders.slice(0, 5).map(o => (
                    <div key={o._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-800/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-2 rounded-full ${o.isDelivered ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <span className="text-sm font-mono text-gray-300">#{o._id.slice(-8).toUpperCase()}</span>
                        <span className="text-gray-400 text-sm">{o.user?.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-300">{o.totalPrice?.toFixed(2)} MAD</span>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                      <ShoppingCart size={32} className="mx-auto mb-3 opacity-50" />
                      <p>Aucune commande récente</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {section === 'messages' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Messages ({filteredContacts.length})</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un message..."
                  value={contactSearch}
                  onChange={e => setContactSearch(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700/50 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
              {filteredContacts.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                  <Mail size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucun message trouvé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map(c => (
                    <div key={c._id} className={`bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden transition-all ${!c.read ? 'border-blue-500/30' : ''}`}>
                      <button
                        onClick={() => setExpandedContact(expandedContact === c._id ? null : c._id)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {c.read ? <MailOpen size={18} className="text-gray-500" /> : <Mail size={18} className="text-blue-400" />}
                          <div>
                            <p className={`text-sm ${c.read ? 'text-gray-400' : 'text-white font-semibold'}`}>{c.subject}</p>
                            <p className="text-xs text-gray-500">{c.name} — {c.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!c.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                          {expandedContact === c._id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                        </div>
                      </button>
                      {expandedContact === c._id && (
                        <div className="px-4 pb-4 border-t border-gray-800/50 pt-3">
                          <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{c.message}</p>
                          <div className="flex gap-3">
                            {!c.read && (
                              <button onClick={() => markAsRead(c._id)} className="px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all">
                                Marquer lu
                              </button>
                            )}
                            <button onClick={() => setConfirmDeleteContact(c._id)} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all">
                              Supprimer
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Utilisateurs ({filteredUsers.length})</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700/50 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
              {filteredUsers.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800/50 text-gray-500 text-xs uppercase tracking-widest">
                        <th className="px-6 py-3">Utilisateur</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Rôle</th>
                        <th className="px-6 py-3">Inscrit</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-gray-700/50 text-gray-400'}`}>
                              {u.role === 'admin' ? <Shield size={12} className="inline mr-1" /> : <Users size={12} className="inline mr-1" />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => setConfirmDeleteUser(u._id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Commandes ({filteredOrders.length})</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher par n°, client, suivi..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700/50 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
              {filteredOrders.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucune commande trouvée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(o => (
                    <div key={o._id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-800/20 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Package size={20} className={o.isDelivered ? 'text-green-400' : 'text-amber-400'} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">#{o.orderNumber || o._id.slice(-8).toUpperCase()}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${o.isPaid ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {o.isPaid ? 'Payée' : 'Non payée'}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge(o.status || 'pending')}`}>
                                {statusLabel(o.status || 'pending')}
                              </span>
                              {o.trackingNumber && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-gray-800/50">
                                  {o.trackingNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{o.user?.name || 'N/D'} — {o.totalPrice?.toFixed(2)} MAD — {o.orderItems?.length} article(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</span>
                          {expandedOrder === o._id ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                        </div>
                      </button>
                      {expandedOrder === o._id && (
                        <div className="px-4 pb-4 border-t border-gray-800/50 pt-3 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gray-800/30 rounded-lg p-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Livraison</h4>
                              <p className="text-sm text-gray-300">{o.shippingAddress?.address}</p>
                              <p className="text-xs text-gray-400">{o.shippingAddress?.city}, {o.shippingAddress?.postalCode}</p>
                              <p className="text-xs text-gray-400">{o.shippingAddress?.country}</p>
                            </div>
                            <div className="bg-gray-800/30 rounded-lg p-4">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Paiement</h4>
                              <p className="text-sm text-gray-300">{o.paymentMethod}</p>
                              <p className={`text-xs mt-1 ${o.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                                {o.isPaid ? `Payé le ${new Date(o.paidAt).toLocaleDateString('fr-FR')}` : 'Non payé'}
                              </p>
                            </div>
                          </div>

                          <div className="bg-gray-800/30 rounded-lg p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Articles</h4>
                            <div className="space-y-2">
                              {o.orderItems?.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-700/30 last:border-0">
                                  <img src={item.image} alt="" className="w-10 h-10 object-cover rounded" />
                                  <div className="flex-1">
                                    <p className="text-sm text-white">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity} x {item.price} MAD{item.size ? ` — Taille: ${item.size}` : ''}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Statut :</label>
                            <select
                              value={o.status || 'pending'}
                              onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                              className="bg-gray-800 border border-gray-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 uppercase tracking-wider"
                            >
                              <option value="pending">En attente</option>
                              <option value="confirmed">Confirmée</option>
                              <option value="processing">En préparation</option>
                              <option value="shipped">Expédiée</option>
                              <option value="delivered">Livrée</option>
                            </select>
                            {!o.isPaid && (
                              <button onClick={() => markPaid(o._id)} className="px-3 py-2 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all">
                                Paiement
                              </button>
                            )}
                            {o.isPaid && o.isDelivered && (
                              <button onClick={() => setConfirmDeleteOrder(o._id)} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all flex items-center gap-1.5">
                                <Trash2 size={12} /> Supprimer
                              </button>
                            )}
                          </div>

                          {o.status === 'shipped' && (
                            <div className="bg-gray-800/30 rounded-lg p-4 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Suivi livreur</h4>
                              <div className="grid grid-cols-2 gap-3">
                                <input type="text" id={`driver-name-${o._id}`} defaultValue={o.delivery?.driverName || ''} placeholder="Nom livreur" className="bg-gray-800/60 border border-gray-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-500/50" />
                                <input type="text" id={`driver-phone-${o._id}`} defaultValue={o.delivery?.driverPhone || ''} placeholder="Téléphone" className="bg-gray-800/60 border border-gray-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-500/50" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input type="number" step="any" id={`driver-lat-${o._id}`} defaultValue={o.delivery?.lat || ''} placeholder="Latitude" className="bg-gray-800/60 border border-gray-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-500/50" />
                                <input type="number" step="any" id={`driver-lng-${o._id}`} defaultValue={o.delivery?.lng || ''} placeholder="Longitude" className="bg-gray-800/60 border border-gray-700/50 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-red-500/50" />
                              </div>
                              <button
                                onClick={() => {
                                  const name = document.getElementById(`driver-name-${o._id}`).value;
                                  const phone = document.getElementById(`driver-phone-${o._id}`).value;
                                  const lat = parseFloat(document.getElementById(`driver-lat-${o._id}`).value);
                                  const lng = parseFloat(document.getElementById(`driver-lng-${o._id}`).value);
                                  axios.put(`${API}/orders/${o._id}/delivery-location`, { driverName: name, driverPhone: phone, lat, lng }, { headers: getAuthHeaders() })
                                    .then(({ data }) => setOrders(prev => prev.map(ord => ord._id === o._id ? data : ord)))
                                    .catch(err => console.error(err));
                                }}
                                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-all"
                              >
                                Mettre à jour la position
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'reviews' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Avis ({filteredReviews.length})</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Rechercher un avis..."
                  value={reviewSearch}
                  onChange={e => setReviewSearch(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700/50 text-white pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                />
              </div>
              {filteredReviews.length === 0 ? (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                  <Star size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucun avis trouvé</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReviews.map(r => (
                    <div key={r._id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {r.user?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{r.user?.name || 'Anonyme'}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{r.product?.name || 'Produit inconnu'}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={14} className={s <= r.rating ? 'text-yellow-400' : 'text-gray-600'} fill={s <= r.rating ? 'currentColor' : 'none'} />
                              ))}
                              <span className="text-xs text-gray-500 ml-2">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <p className="text-sm text-gray-300 mt-2">{r.comment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleReviewApproval(r._id, 'isApproved')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${r.isApproved ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
                          >
                            {r.isApproved ? <CheckCircle size={14} className="inline mr-1" /> : <EyeOff size={14} className="inline mr-1" />}
                            {r.isApproved ? 'Approuvé' : 'Approuver'}
                          </button>
                          <button
                            onClick={() => toggleReviewApproval(r._id, 'isHidden')}
                            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${r.isHidden ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
                          >
                            {r.isHidden ? <EyeOff size={14} className="inline mr-1" /> : <Eye size={14} className="inline mr-1" />}
                            {r.isHidden ? 'Masqué' : 'Visible'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteReview(r._id)}
                            className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={14} className="inline mr-1" /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {section === 'gifts' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Produits Cadeaux</h3>
                <button
                  onClick={() => { setEditingGift(null); setGiftForm({ name: '', image: '', description: '' }); setShowGiftForm(true); }}
                  className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              {showGiftForm && (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                  <h4 className="text-sm font-semibold mb-4">{editingGift ? 'Modifier' : 'Nouveau'} Produit Cadeau</h4>
                  <form onSubmit={handleGiftSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom</label>
                      <input
                        type="text"
                        required
                        value={giftForm.name}
                        onChange={e => setGiftForm({ ...giftForm, name: e.target.value })}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">URL de l'image</label>
                      <input
                        type="text"
                        required
                        value={giftForm.image}
                        onChange={e => setGiftForm({ ...giftForm, image: e.target.value })}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <textarea
                        value={giftForm.description}
                        onChange={e => setGiftForm({ ...giftForm, description: e.target.value })}
                        rows={3}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" className="px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-500/20 transition-all">
                        {editingGift ? 'Modifier' : 'Créer'}
                      </button>
                      <button type="button" onClick={() => { setShowGiftForm(false); setEditingGift(null); }} className="px-4 py-2 bg-gray-700/50 text-gray-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-700 transition-all">
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {giftProducts.length === 0 && !showGiftForm ? (
                <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                  <Gift size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Aucun produit cadeau</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {giftProducts.map(g => (
                    <div key={g._id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl overflow-hidden">
                      <img src={g.image} alt={g.name} className="w-full aspect-square object-cover" />
                      <div className="p-3">
                        <p className="text-sm text-white font-semibold truncate">{g.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${g.isActive ? 'text-green-400' : 'text-red-400'}`}>
                            {g.isActive ? 'Actif' : 'Inactif'}
                          </span>
                          <div className="flex gap-2">
                            <button onClick={() => editGift(g)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => setConfirmDeleteGift(g._id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-800/50 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings size={18} /> Promotion Configuration
                </h3>
                {promoConfig && (
                  <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 max-w-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Activer la promotion</span>
                      <button
                        onClick={() => updatePromoConfig({ isEnabled: !promoConfig.isEnabled })}
                        className={`w-12 h-6 rounded-full transition-all relative ${promoConfig.isEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${promoConfig.isEnabled ? 'left-6' : 'left-0.5'}`} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Quantité minimale</label>
                      <input
                        type="number"
                        value={promoConfig.minQuantity}
                        onChange={e => updatePromoConfig({ minQuantity: Number(e.target.value) })}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Montant minimum (MAD)</label>
                      <input
                        type="number"
                        value={promoConfig.minAmount}
                        onChange={e => updatePromoConfig({ minAmount: Number(e.target.value) })}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Filtre de catégorie</label>
                      <input
                        type="text"
                        value={promoConfig.categoryFilter}
                        onChange={e => updatePromoConfig({ categoryFilter: e.target.value })}
                        className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'vip' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Crown size={18} className="text-yellow-400" /> VIP
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Membres VIP</h4>
                  {vipMembers.length === 0 ? (
                    <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl py-16 text-center text-gray-500">
                      <Crown size={48} className="mx-auto mb-4 opacity-30" />
                      <p>Aucun membre VIP</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vipMembers.map(m => (
                        <div key={m._id} className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black font-bold text-sm">
                              {m.user?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm text-white font-semibold">{m.user?.name || 'N/D'}</p>
                              <p className="text-xs text-gray-500">{m.user?.email || 'N/D'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold uppercase tracking-wider ${m.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              {m.isActive ? 'Actif' : 'Expiré'}
                            </span>
                            <p className="text-xs text-gray-500">{m.remainingDays} jours restants</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Settings size={14} /> VIP Config
                  </h4>
                  {vipConfig && (
                    <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Activer le programme</span>
                        <button
                          onClick={() => updateVipConfig({ isActive: !vipConfig.isActive })}
                          className={`w-12 h-6 rounded-full transition-all relative ${vipConfig.isActive ? 'bg-green-500' : 'bg-gray-700'}`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${vipConfig.isActive ? 'left-6' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Achats minimum</label>
                        <input
                          type="number"
                          value={vipConfig.minPurchaseCount}
                          onChange={e => updateVipConfig({ minPurchaseCount: Number(e.target.value) })}
                          className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Dépense minimum (MAD)</label>
                        <input
                          type="number"
                          value={vipConfig.minSpendingAmount}
                          onChange={e => updateVipConfig({ minSpendingAmount: Number(e.target.value) })}
                          className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Réduction %</label>
                        <input
                          type="number"
                          value={vipConfig.discountPercent}
                          onChange={e => updateVipConfig({ discountPercent: Number(e.target.value) })}
                          className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Durée (jours)</label>
                        <input
                          type="number"
                          value={vipConfig.durationDays}
                          onChange={e => updateVipConfig({ durationDays: Number(e.target.value) })}
                          className="w-full bg-gray-800/60 border border-gray-700/50 text-white px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <ConfirmModal show={confirmDeleteContact !== null} title="Supprimer le message" message="Voulez-vous vraiment supprimer ce message ?" confirmText="Supprimer" cancelText="Annuler" danger onConfirm={deleteContact} onCancel={() => setConfirmDeleteContact(null)} />
      <ConfirmModal show={confirmDeleteUser !== null} title="Supprimer l'utilisateur" message="Voulez-vous vraiment supprimer cet utilisateur ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" danger onConfirm={deleteUser} onCancel={() => setConfirmDeleteUser(null)} />
      <ConfirmModal show={confirmDeleteReview !== null} title="Supprimer l'avis" message="Voulez-vous vraiment supprimer cet avis ?" confirmText="Supprimer" cancelText="Annuler" danger onConfirm={deleteReview} onCancel={() => setConfirmDeleteReview(null)} />
      <ConfirmModal show={confirmDeleteGift !== null} title="Supprimer le cadeau" message="Voulez-vous vraiment supprimer ce produit cadeau ?" confirmText="Supprimer" cancelText="Annuler" danger onConfirm={deleteGift} onCancel={() => setConfirmDeleteGift(null)} />
      <ConfirmModal show={confirmDeleteOrder !== null} title="Supprimer la commande" message="Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible." confirmText="Supprimer" cancelText="Annuler" danger onConfirm={deleteOrder} onCancel={() => setConfirmDeleteOrder(null)} />
    </div>
  );
};

export default AdminDashboard;
