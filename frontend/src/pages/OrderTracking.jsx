import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Search, Truck, CheckCircle, Clock, MapPin, ShoppingBag, Phone, User, Locate } from 'lucide-react';
import DeliveryMap from '../components/DeliveryMap';

const API = 'http://localhost:5000/api';

const statusConfig = {
  pending: { label: 'En attente', color: 'text-yellow-400', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'text-blue-400', icon: CheckCircle },
  processing: { label: 'En préparation', color: 'text-amber-400', icon: Package },
  shipped: { label: 'Expédiée', color: 'text-purple-400', icon: Truck },
  delivered: { label: 'Livrée', color: 'text-green-400', icon: CheckCircle },
};

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('q') || '');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const submittedRef = useRef(false);

  const fetchTracking = async (tn) => {
    try {
      const res = await fetch(`${API}/orders/track/${tn}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setTracking(data);
      return data;
    } catch (_) {
      setError('Aucune commande trouvée avec ce numéro de suivi.');
      setTracking(null);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tn = trackingNumber.trim().toUpperCase();
    if (!tn) return;
    setLoading(true);
    setError('');
    setTracking(null);
    const data = await fetchTracking(tn);
    setLoading(false);
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !submittedRef.current) {
      submittedRef.current = true;
      setTrackingNumber(q);
      setLoading(true);
      fetchTracking(q.trim().toUpperCase()).then(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (tracking && tracking.status === 'shipped') {
      intervalRef.current = setInterval(() => {
        fetchTracking(tracking.trackingNumber);
      }, 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [tracking?.trackingNumber, tracking?.status]);

  const StatusIcon = tracking ? statusConfig[tracking.status]?.icon || Package : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">Suivi de <span className="text-red-600">Commande</span></h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">Entrez votre numéro de suivi pour localiser votre livreur en temps réel.</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto mb-12"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="N° commande ou AK-XXXX-XXXX"
              className="flex-1 bg-black/50 border border-white/10 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-gold-500 uppercase tracking-wider"
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gold-500 text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-gold-400 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} /> {loading ? '...' : 'Suivre'}
            </motion.button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </motion.form>

        {tracking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full bg-opacity-20 ${tracking.status === 'delivered' ? 'bg-green-500/20' : 'bg-gold-500/20'}`}>
                  {StatusIcon && <StatusIcon size={28} className={statusConfig[tracking.status]?.color || 'text-gold-500'} />}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Commande {tracking.trackingNumber}</h3>
                  <p className={`font-bold uppercase text-sm ${statusConfig[tracking.status]?.color}`}>
                    {statusConfig[tracking.status]?.label || tracking.status}
                  </p>
                </div>
              </div>

              <div className="space-y-0">
                {tracking.timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.done ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                        {step.done
                          ? <CheckCircle size={16} className="text-green-400" />
                          : <div className="w-3 h-3 rounded-full bg-gray-600" />
                        }
                      </div>
                      {i < tracking.timeline.length - 1 && (
                        <div className={`w-0.5 h-10 ${step.done ? 'bg-green-500/30' : 'bg-gray-800'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-bold ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-0.5">{new Date(step.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {tracking.status === 'shipped' && tracking.delivery?.lat && tracking.delivery?.lng && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Locate size={20} className="text-red-500" />
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm">Localisation du livreur en temps réel</h4>
                  {tracking.delivery?.locationUpdatedAt && (
                    <span className="text-[10px] text-gray-500 ml-auto">
                      Mis à jour : {new Date(tracking.delivery.locationUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
                <DeliveryMap
                  lat={tracking.delivery.lat}
                  lng={tracking.delivery.lng}
                  driverName={tracking.delivery.driverName}
                  driverPhone={tracking.delivery.driverPhone}
                  locationUpdatedAt={tracking.delivery.locationUpdatedAt}
                />
              </motion.div>
            )}

            {tracking.delivery?.driverName && (
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                  <Truck size={16} className="text-gold-500" /> Livreur
                </h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center">
                    <User size={22} className="text-gold-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{tracking.delivery.driverName}</p>
                    {tracking.delivery.driverPhone && (
                      <a href={`tel:${tracking.delivery.driverPhone}`} className="text-gold-500 text-sm flex items-center gap-1 hover:underline mt-1">
                        <Phone size={14} /> {tracking.delivery.driverPhone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                  <ShoppingBag size={16} className="text-gold-500" /> Produits
                </h4>
                <div className="space-y-3">
                  {tracking.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-gray-500 text-xs">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h4 className="text-white font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-gold-500" /> Adresse de livraison
                </h4>
                <p className="text-gray-300 text-sm">{tracking.shippingAddress?.address}</p>
                <p className="text-gray-400 text-sm">{tracking.shippingAddress?.city}, {tracking.shippingAddress?.postalCode}</p>
                <p className="text-gray-400 text-sm">{tracking.shippingAddress?.country}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
