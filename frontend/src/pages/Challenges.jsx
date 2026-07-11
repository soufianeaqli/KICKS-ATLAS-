import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { Gift, Crown, ShoppingBag, Trophy, CheckCircle, Clock, Settings, X, Save, Search, Sparkles, Lock, ArrowRight } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { API_URL } from '../config';

const API = API_URL;

/* -------------------------------------------------------------------------- */
/*  Animated progress bar                                                       */
/* -------------------------------------------------------------------------- */
const ProgressBar = ({ percent, color = 'bg-amber-400', label }) => (
  <div className="mb-4">
    <div className="flex items-center justify-between text-sm mb-2">
      <span className="text-gray-400">Progression</span>
      <span className="font-bold text-white">{label}</span>
    </div>
    <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
        style={{ width: `${Math.min(100, percent)}%` }}
      />
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Gift Picker Modal                                                           */
/* -------------------------------------------------------------------------- */
const GiftPickerModal = ({ onClose, onPick }) => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/products?all=true`)
      .then(({ data }) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-gray-900 border border-green-500/30 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl shadow-green-900/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Gift size={20} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">Choisissez votre cadeau</h2>
                <p className="text-gray-400 text-xs mt-0.5">Sélectionnez n'importe quel produit — offert gratuitement</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-gray-800 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 shrink-0">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
            {loading ? (
              <div className="text-center text-gray-500 py-12">Chargement des produits...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-12">Aucun produit trouvé</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map(prod => (
                  <button
                    key={prod._id}
                    onClick={() => setSelected(selected?._id === prod._id ? null : prod)}
                    className={`text-left border rounded-xl p-3 transition-all group ${
                      selected?._id === prod._id
                        ? 'border-green-500 bg-green-900/30 ring-1 ring-green-500/50'
                        : 'border-gray-700 bg-gray-800/50 hover:border-green-500/50 hover:bg-gray-800'
                    }`}
                  >
                    <div className="relative">
                      <img src={prod.images?.[0]} alt={prod.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                      {selected?._id === prod._id && (
                        <div className="absolute top-2 right-2 bg-green-500 rounded-full p-0.5">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-white font-bold text-xs break-words">{prod.name}</p>
                    <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${selected?._id === prod._id ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`}>
                      {selected?._id === prod._id ? '✓ Sélectionné' : 'Choisir ce produit'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 shrink-0">
            <button
              disabled={!selected}
              onClick={() => onPick(selected)}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${
                selected
                  ? 'bg-green-500 hover:bg-green-400 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Gift size={16} />
              {selected ? `Confirmer — ${selected.name}` : 'Sélectionnez un produit'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/*  Admin Config Panel                                                          */
/* -------------------------------------------------------------------------- */
const AdminGiftConfig = ({ onClose, token, onSaved }) => {
  const [config, setConfig] = useState({ isEnabled: false, minQuantity: 5 });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    axios.get(`${API}/gifts/config`).then(({ data }) => setConfig({ isEnabled: data.isEnabled, minQuantity: data.minQuantity })).catch(console.error);
  }, []);
  const save = async () => {
    setSaving(true);
    try { await axios.put(`${API}/gifts/config`, config, { headers: { Authorization: `Bearer ${token}` } }); onSaved(); onClose(); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };
  return (
    <div className="mt-4 bg-gray-800/60 border border-yellow-500/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 text-yellow-400"><Settings size={14} /> Config Admin — Cadeau</h3>
        <button onClick={onClose}><X size={16} className="text-gray-500" /></button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Activer la promotion</span>
        <button onClick={() => setConfig({ ...config, isEnabled: !config.isEnabled })}
          className={`w-12 h-6 rounded-full transition-colors ${config.isEnabled ? 'bg-green-500' : 'bg-gray-600'} relative`}>
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${config.isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Quantité minimale de produits nationaux</label>
        <input type="number" value={config.minQuantity} onChange={e => setConfig({ ...config, minQuantity: Number(e.target.value) })}
          className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
      </div>
      <button onClick={save} disabled={saving} className="w-full py-2.5 bg-yellow-400 text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors rounded-lg flex items-center justify-center gap-2">
        <Save size={14} /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
    </div>
  );
};

const AdminVipConfig = ({ onClose, token, onSaved }) => {
  const [config, setConfig] = useState({ isActive: false, minPurchaseCount: 10, minSpendingAmount: 0, discountPercent: 15, durationDays: 30 });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    axios.get(`${API}/vip/config`).then(({ data }) => setConfig({ isActive: data.isActive, minPurchaseCount: data.minPurchaseCount, minSpendingAmount: data.minSpendingAmount, discountPercent: data.discountPercent, durationDays: data.durationDays })).catch(console.error);
  }, []);
  const save = async () => {
    setSaving(true);
    try { await axios.put(`${API}/vip/config`, config, { headers: { Authorization: `Bearer ${token}` } }); onSaved(); onClose(); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };
  return (
    <div className="mt-4 bg-gray-800/60 border border-yellow-500/20 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 text-yellow-400"><Settings size={14} /> Config Admin — VIP</h3>
        <button onClick={onClose}><X size={16} className="text-gray-500" /></button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">Activer le programme VIP</span>
        <button onClick={() => setConfig({ ...config, isActive: !config.isActive })}
          className={`w-12 h-6 rounded-full transition-colors ${config.isActive ? 'bg-green-500' : 'bg-gray-600'} relative`}>
          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${config.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>
      {[
        { label: "Nombre d'achats minimum (articles livrés)", key: 'minPurchaseCount' },
        { label: 'Dépense minimale en MAD (0 = désactivé)', key: 'minSpendingAmount' },
        { label: 'Réduction VIP (%)', key: 'discountPercent' },
        { label: 'Durée du statut VIP (jours)', key: 'durationDays' },
      ].map(({ label, key }) => (
        <div key={key}>
          <label className="block text-xs text-gray-400 mb-1">{label}</label>
          <input type="number" value={config[key]} onChange={e => setConfig({ ...config, [key]: Number(e.target.value) })}
            className="w-full bg-black/40 border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-yellow-500" />
        </div>
      ))}
      <button onClick={save} disabled={saving} className="w-full py-2.5 bg-yellow-400 text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors rounded-lg flex items-center justify-center gap-2">
        <Save size={14} /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
      </button>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Confirmation Toast Notification                                             */
/* -------------------------------------------------------------------------- */
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-8 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-[slideIn_0.3s_ease-out] ${
      type === 'success' ? 'bg-green-900 border-green-500/40 text-green-200' : 'bg-red-900 border-red-500/40 text-red-200'
    }`}>
      {type === 'success' ? <CheckCircle size={20} className="text-green-400 shrink-0" /> : <X size={20} className="text-red-400 shrink-0" />}
      <p className="text-sm font-semibold">{message}</p>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
};

/* ========================================================================== */
/*  Main Component                                                              */
/* ========================================================================== */
const Challenges = () => {
  const { userInfo } = useAuthStore();
  const navigate = useNavigate();
  const { freeGift, setFreeGift } = useCartStore();

  const [challenges, setChallenges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGiftPicker, setShowGiftPicker] = useState(false);
  const [showGiftAdminConfig, setShowGiftAdminConfig] = useState(false);
  const [showVipAdminConfig, setShowVipAdminConfig] = useState(false);
  const [toast, setToast] = useState(null);

  const isAdmin = userInfo?.role === 'admin';

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    fetchChallenges();
  }, [userInfo, navigate]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/users/challenges`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setChallenges(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePickGift = (product) => {
    setFreeGift({ product: product._id, name: product.name, image: product.images?.[0], price: 0, quantity: 1 });
    setShowGiftPicker(false);
    setToast({ message: `✅ "${product.name}" ajouté comme cadeau gratuit — finalisez votre commande !`, type: 'success' });
  };

  if (!userInfo) return null;

  /* -------------------------------------------------------- */
  /*  Loading                                                  */
  /* -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Trophy size={32} className="mx-auto mb-4 text-gold-500 animate-pulse" />
          <p>Chargement de vos défis...</p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------- */
  /*  Derived state                                            */
  /* -------------------------------------------------------- */
  const gift = challenges?.gift;
  const vip = challenges?.vip;

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-3xl">

        {/* Page Header */}
        <div className="flex items-center justify-between gap-3 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gold-500/10 rounded-xl">
              <Trophy size={24} className="text-gold-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Mes Défis</h1>
              <p className="text-white-500 text-sm mt-0.5">Complétez les défis pour débloquer vos récompenses</p>
            </div>
          </div>
          {isAdmin && (
            <span className="bg-yellow-500/10 text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-yellow-500/20">
              Admin
            </span>
          )}
        </div>

        <div className="space-y-5">

          {/* ─────────────────────────────────────────── */}
          {/*  GIFT CHALLENGE CARD                        */}
          {/* ─────────────────────────────────────────── */}
          {gift && !gift.alreadyRedeemed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
              gift.eligible
                ? 'border-green-500/60 bg-gradient-to-br from-green-950/60 to-emerald-950/40 shadow-lg shadow-green-900/20'
                : 'border-gray-800 bg-gray-900/40'
            }`}>
              <div className="p-6 md:p-8">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${gift.eligible ? 'bg-green-500/20' : 'bg-gray-800'}`}>
                      {gift.eligible
                        ? <Sparkles size={24} className="text-green-400" />
                        : <Gift size={24} className="text-gray-500" />
                      }
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Cadeau Gratuit</h2>
                      <p className="text-sm text-gray-400">Un produit de votre choix, offert gratuitement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {gift.eligible && (
                      <span className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-green-500/30">
                        <CheckCircle size={12} /> Débloqué
                      </span>
                    )}
                    {isAdmin && (
                      <button onClick={() => setShowGiftAdminConfig(v => !v)} className="p-2 bg-gray-800 hover:bg-yellow-500/20 rounded-lg transition-colors border border-gray-700 hover:border-yellow-500/30">
                        <Settings size={15} className="text-gray-400 hover:text-yellow-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {!gift.alreadyRedeemed && (
                  <ProgressBar
                    percent={gift.progress}
                    color={gift.eligible ? 'bg-green-500' : gift.progress > 60 ? 'bg-amber-400' : 'bg-amber-600'}
                    label={`${gift.current} / ${gift.target} produits nationaux`}
                  />
                )}

                {/* Status Block */}
                <div className={`rounded-xl p-5 border ${gift.eligible ? 'bg-green-900/20 border-green-500/25' : 'bg-gray-800/40 border-gray-700'}`}>
                  {!gift.isActive ? (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Lock size={16} />
                      <p className="text-sm">Cette promotion n'est pas encore active.</p>
                    </div>
                  ) : gift.eligible ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={18} className="text-green-400" />
                        <p className="text-green-300 font-bold text-sm">Félicitations ! Votre cadeau est débloqué.</p>
                      </div>

                      {freeGift ? (
                        <div className="flex items-center gap-4 bg-black/30 rounded-xl p-3 mb-4">
                          <img src={freeGift.image} alt={freeGift.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm break-words">{freeGift.name}</p>
                            <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Cadeau sélectionné — Gratuit</p>
                          </div>
                          <button onClick={() => setShowGiftPicker(true)} className="text-xs text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg">
                            Changer
                          </button>
                        </div>
                      ) : null}

                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => setShowGiftPicker(true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all shadow-lg shadow-green-900/30"
                        >
                          <Gift size={16} />
                          {freeGift ? 'Changer mon cadeau' : 'Choisir mon cadeau gratuit'}
                        </button>
                        {freeGift && (
                          <button
                            onClick={() => navigate('/checkout')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-100 transition-all"
                          >
                            Commander maintenant <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Achetez encore{' '}
                      <span className="text-amber-400 font-bold">{Math.max(0, gift.target - gift.current)}</span>{' '}
                      produit{Math.max(0, gift.target - gift.current) > 1 ? 's' : ''} de l'Équipe Nationale pour débloquer un cadeau gratuit de votre choix.
                    </p>
                  )}
                </div>

                {/* Admin Config Panel */}
                {isAdmin && showGiftAdminConfig && (
                  <AdminGiftConfig
                    token={userInfo.token}
                    onClose={() => setShowGiftAdminConfig(false)}
                    onSaved={fetchChallenges}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* Gift ALREADY REDEEMED — compact card */}
          {gift?.alreadyRedeemed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-green-900/40 bg-green-950/20 overflow-hidden"
            >
              <div className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-900/30 rounded-xl shrink-0">
                  <CheckCircle size={22} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black uppercase tracking-tight text-green-700">Cadeau Gratuit — Réclamé ✓</h2>
                  <p className="text-green-800 text-sm mt-0.5">Vous avez déjà utilisé cette récompense. Merci pour votre achat !</p>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowGiftAdminConfig(v => !v)} className="p-2 bg-gray-800 hover:bg-yellow-500/20 rounded-lg transition-colors border border-gray-700 hover:border-yellow-500/30 shrink-0">
                    <Settings size={15} className="text-gray-400" />
                  </button>
                )}
              </div>
              {isAdmin && showGiftAdminConfig && (
                <div className="px-6 pb-6">
                  <AdminGiftConfig token={userInfo.token} onClose={() => setShowGiftAdminConfig(false)} onSaved={fetchChallenges} />
                </div>
              )}
            </motion.div>
          )}

          {/* ─────────────────────────────────────────── */}
          {/*  VIP CHALLENGE CARD                         */}
          {/* ─────────────────────────────────────────── */}
          {vip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`rounded-2xl border overflow-hidden transition-all duration-500 ${
              vip.isActive
                ? 'border-purple-500/60 bg-gradient-to-br from-purple-950/60 to-amber-950/30 shadow-lg shadow-purple-900/20'
                : vip.eligible
                ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-transparent'
                : 'border-gray-800 bg-gray-900/40'
            }`}>
              <div className="p-6 md:p-8">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${vip.isActive ? 'bg-yellow-500/20' : vip.eligible ? 'bg-purple-500/10' : 'bg-gray-800'}`}>
                      <Crown size={24} className={vip.isActive ? 'text-yellow-400' : vip.eligible ? 'text-purple-400' : 'text-gray-500'} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight">Statut VIP Atlas</h2>
                      <p className="text-sm text-gray-400 whitespace-nowrap">{vip.discount}% de réduction sur tous les produits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {vip.isActive && (
                      <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-yellow-500/30">
                        <Crown size={12} /> Actif
                      </span>
                    )}
                    {isAdmin && (
                      <button onClick={() => setShowVipAdminConfig(v => !v)} className="p-2 bg-gray-800 hover:bg-yellow-500/20 rounded-lg transition-colors border border-gray-700 hover:border-yellow-500/30">
                        <Settings size={15} className="text-gray-400 hover:text-yellow-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* VIP Active Banner */}
                {vip.isActive ? (
                  <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-4">
                    <div className="p-2 bg-yellow-500/20 rounded-lg shrink-0">
                      <Clock size={20} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-yellow-300 font-bold">Statut VIP actif — {vip.remainingDays} jour{vip.remainingDays > 1 ? 's' : ''} restant{vip.remainingDays > 1 ? 's' : ''}</p>
                      <p className="text-yellow-500 text-xs mt-0.5">{vip.discount}% de réduction appliquée automatiquement à chaque commande</p>
                    </div>
                  </div>
                ) : vip.eligible ? (
                  <div className="bg-purple-900/20 border border-purple-500/25 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={16} className="text-purple-400" />
                      <p className="text-purple-300 font-bold text-sm">Seuil atteint ! Votre statut VIP sera activé à la prochaine livraison.</p>
                    </div>
                  </div>
                ) : vip.programActive ? (
                  <>
                    <ProgressBar
                      percent={vip.progress}
                      color={vip.eligible ? 'bg-purple-500' : vip.progress > 60 ? 'bg-amber-400' : 'bg-amber-600'}
                      label={`${vip.current} / ${vip.target} articles livrés`}
                    />
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 text-sm text-gray-400">
                      <p>
                        Achetez encore{' '}
                        <span className="text-amber-400 font-bold">{Math.max(0, vip.target - vip.current)}</span>{' '}
                        produit{Math.max(0, vip.target - vip.current) > 1 ? 's' : ''} pour devenir membre VIP et obtenir{' '}
                        <span className="text-purple-400 font-bold">{vip.discount}%</span>{' '}
                        de réduction sur tous nos produits pendant{' '}
                        <span className="text-white font-bold">30 jours</span>.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 text-gray-500">
                      <Lock size={16} />
                      <p className="text-sm">Le programme VIP n'est pas encore actif.</p>
                    </div>
                  </div>
                )}

                {/* Admin Config Panel */}
                {isAdmin && showVipAdminConfig && (
                  <AdminVipConfig
                    token={userInfo.token}
                    onClose={() => setShowVipAdminConfig(false)}
                    onSaved={fetchChallenges}
                  />
                )}
              </div>
            </motion.div>
          )}

          {/* ─────────────────────────────────────────── */}
          {/*  STATS SUMMARY                              */}
          {/* ─────────────────────────────────────────── */}
          {challenges && (
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 md:p-8">
              <h3 className="font-black uppercase tracking-tight mb-5 flex items-center gap-2 text-sm text-gray-400">
                <ShoppingBag size={16} className="text-gold-500" /> Résumé de votre activité
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Articles livrés', value: challenges.totalItems, icon: <ShoppingBag size={18} /> },
                  { label: 'Produits nationaux', value: challenges.nationalQty, icon: <Gift size={18} /> },
                  { label: 'Total dépensé', value: <span className="whitespace-nowrap">{(challenges.totalSpent || 0).toFixed(0)} MAD</span>, icon: <Trophy size={18} /> },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-800/40 rounded-xl p-5 text-center border border-gray-700/50">
                    <div className="flex justify-center text-gold-500 mb-2">{s.icon}</div>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Gift Picker Modal */}
      {showGiftPicker && (
        <GiftPickerModal
          onClose={() => setShowGiftPicker(false)}
          onPick={handlePickGift}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Challenges;
