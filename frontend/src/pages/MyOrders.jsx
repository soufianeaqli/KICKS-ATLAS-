import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Package, ChevronDown, ChevronUp, ShoppingCart, Truck, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const API = 'http://localhost:5000/api';
const PER_PAGE = 6;

const MyOrders = () => {
  const { userInfo } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(orders.length / PER_PAGE));
  const paginatedOrders = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    if (!userInfo) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API}/orders/myorders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setOrders(data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchOrders();
  }, [userInfo]);

  useEffect(() => { setPage(1); }, [orders.length]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/orders/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setOrders(prev => prev.filter(o => o._id !== id));
      setExpanded(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  if (!userInfo) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <main className="p-6 md:p-10 max-w-4xl mx-auto">
        <h1 className="text-2xl font-black uppercase tracking-tight mb-8">Mes Achats</h1>

        {loading ? (
          <LoadingSpinner text="Chargement de vos commandes..." />
        ) : orders.length === 0 ? (
          <div className="border border-gray-700 border-dashed rounded-lg h-64 flex flex-col items-center justify-center">
            <ShoppingCart size={48} className="mb-4 text-gray-500" />
            <p className="font-bold uppercase tracking-widest text-gray-300">Aucune commande</p>
            <p className="text-sm mt-2 text-gray-400">Vous n'avez pas encore passé de commande.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <AnimatePresence>
              {paginatedOrders.map(o => (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Package size={18} className="text-gold-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-white font-bold break-words">Commande #{o.orderNumber || o._id.slice(-8).toUpperCase()}</h3>
                            {o.trackingNumber && (
                              <span className="text-[10px] font-mono text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded uppercase tracking-wider">{o.trackingNumber}</span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${o.isPaid ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {o.isPaid ? 'Payée' : 'Non payée'}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-gray-700/50 text-gray-300">
                              {o.status || 'pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1"><span className="whitespace-nowrap">{o.totalPrice?.toFixed(2)} MAD</span> — {o.orderItems?.length} article(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <button onClick={() => setExpanded(expanded === o._id ? null : o._id)} className="p-1.5 text-gray-500 hover:text-white transition-colors">
                          {expanded === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  {expanded === o._id && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-800">
                      <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider font-bold mb-2">Livraison</p>
                          <p className="text-gray-300">{o.shippingAddress?.address}</p>
                          <p className="text-gray-300">{o.shippingAddress?.city}, {o.shippingAddress?.postalCode}</p>
                          <p className="text-gray-300">{o.shippingAddress?.country}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider font-bold mb-2">Paiement</p>
                          <p className="text-gray-300">{o.paymentMethod}</p>
                          <p className="text-gray-300">{o.isPaid ? `Payé le ${new Date(o.paidAt).toLocaleDateString('fr-FR')}` : 'Non payé'}</p>
                        </div>
                      </div>
                      {o.delivery?.driverName && (
                        <div className="mt-4 bg-gray-800/30 rounded-lg p-4">
                          <p className="text-gray-500 uppercase text-xs tracking-wider font-bold mb-2">Livreur</p>
                          <div className="flex items-center gap-3">
                            <Truck size={16} className="text-gold-500" />
                            <div>
                              <p className="text-white text-sm font-bold">{o.delivery.driverName}</p>
                              {o.delivery.driverPhone && <p className="text-gold-500 text-xs">{o.delivery.driverPhone}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      {o.trackingNumber && (
                        <div className="mt-4 mb-4">
                          <Link to={`/order-tracking?q=${o.trackingNumber || o.orderNumber}`} className="text-gold-500 hover:text-gold-400 text-sm font-bold flex items-center gap-2 transition-colors">
                            <Package size={14} /> Suivre ma commande ({o.trackingNumber || `#${o.orderNumber}`})
                          </Link>
                        </div>
                      )}
                      <div className="mt-4">
                        <p className="text-gray-500 uppercase text-xs tracking-wider font-bold mb-2">Articles</p>
                        {o.orderItems?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                            <img src={item.image} alt="" className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-200 text-sm break-words">{item.name}</p>
                              <p className="text-gray-500 text-xs">{item.quantity} x <span className="whitespace-nowrap">{item.price} MAD</span>{item.size ? ` — Taille: ${item.size}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {o.isPaid && o.isDelivered && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <button
                            onClick={() => handleDelete(o._id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-all"
                          >
                            <Trash2 size={14} /> Supprimer cette commande
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${page === p ? 'bg-gold-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
