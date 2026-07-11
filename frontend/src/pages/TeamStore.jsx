import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, ArrowLeft, Plus, Edit3, Trash2 } from 'lucide-react';
import useProductStore from '../store/useProductStore';
import useCartStore from '../store/useCartStore';
import useCartAnimation from '../store/useCartAnimation';
import ConfirmModal from '../components/ConfirmModal';
import useAuthStore from '../store/useAuthStore';
import ProductFormModal from '../components/ProductFormModal';
import axios from 'axios';
import { API_URL } from '../config';

const API = API_URL;

const getAuthHeaders = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) return {};
  return { Authorization: `Bearer ${JSON.parse(info).token}` };
};

const teams = [
  { id: 'raja', name: 'Raja CA', color: '#006233', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/raja-ca.ba14aabe.png' },
  { id: 'wydad', name: 'Wydad AC', color: '#c8102e', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/wydad-ac.9c5c1dee.png' },
  { id: 'asfar', name: 'AS FAR', color: '#dc2626', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/as-far.5362ee4c.png' },
  { id: 'rsberkane', name: 'RS Berkane', color: '#f97316', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/rs-berkane.fd6e0977.png' },
  { id: 'fus', name: 'FUS Rabat', color: '#b91c1c', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/fus-rabat.7968471e.png' },
  { id: 'mas', name: 'MAS Fès', color: '#15803d', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/maghreb-of-fez.428657b6.png' },
  { id: 'dhj', name: 'DH El Jadida', color: '#1d4ed8', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/dh-jadida.2b3dbbcd.png' },
  { id: 'tanger', name: 'IR Tanger', color: '#38bdf8', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/ir-tanger.ba2e8bfb.png' },
  { id: 'codm', name: 'COD Meknès', color: '#fef08a', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/cod-meknes.c426f303.png' },
  { id: 'ocs', name: 'OC Safi', color: '#a855f7', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/olympic-club-safi.63df01bb.png' },
  { id: 'husa', name: 'Hassania Agadir', color: '#0ea5e9', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/hassania-agadir.fc71e44b.png' },
  { id: 'kacm', name: 'KAC Marrakech', color: '#e11d48', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/kac-marrakech.b1f2b06a.png' },
  { id: 'ody', name: 'Olympique Dcheira', color: '#22d3ee', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/olympique-dcheira.4620562f.png' },
  { id: 'rcaz', name: 'RCA Zemamra', color: '#16a34a', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/rca-zemamra.7a883e86.png' },
  { id: 'uts', name: 'UTS Rabat', color: '#84cc16', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/uts-rabat.f1cf445b.png' },
  { id: 'usym', name: 'US Yacoub El Mansour', color: '#64748b', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/union-yacoub-el-mansour.952f12dc.png' },
];

const categoryNames = {
  raja: 'Raja CA', wydad: 'Wydad AC', asfar: 'AS FAR', rsberkane: 'RS Berkane',
  fus: 'FUS Rabat', mas: 'MAS Fès', dhj: 'DH El Jadida', tanger: 'IR Tanger',
  codm: 'COD Meknès', ocs: 'OC Safi', husa: 'Hassania Agadir',
  kacm: 'KAC Marrakech', ody: 'Olympique Dcheira', rcaz: 'RCA Zemamra',
  uts: 'UTS Rabat', usym: 'US Yacoub El Mansour',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const TeamStore = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { trigger: triggerFly } = useCartAnimation();
  const { userInfo } = useAuthStore();
  const isAdmin = userInfo?.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingCart, setPendingCart] = useState(null);
  const [showAuthConfirm, setShowAuthConfirm] = useState(false);
  const [cartBtnRect, setCartBtnRect] = useState(null);

  const team = teams.find(t => t.id === teamId);
  const categoryName = categoryNames[teamId] || teamId;

  useEffect(() => {
    fetchProducts(teamId, { all: 'true' });
  }, [fetchProducts, teamId]);

  const refresh = useCallback(() => fetchProducts(teamId, { all: 'true' }), [fetchProducts, teamId]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/products/${confirmDelete}`, { headers: getAuthHeaders() });
      setConfirmDelete(null);
      refresh();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const teamProducts = products;

  if (!team) {
    return (
      <div className="pt-32 pb-16 min-h-screen text-white text-center">
        <h1 className="text-3xl font-black uppercase">Équipe non trouvée</h1>
        <Link to="/" className="text-gold-500 mt-4 inline-block hover:underline">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Team Hero */}
      <div className="relative pt-32 pb-24 px-6 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${team.color}, #0f1115)` }}></div>
        <div className="container mx-auto relative z-10 text-center">
          <Link to="/botola" className="inline-flex items-center gap-1 text-gray-400 hover:text-gold-500 transition-colors uppercase text-sm tracking-widest font-bold mb-6">
            <ArrowLeft size={16} /> Botola Pro
          </Link>
          <div className="flex items-center justify-center gap-6 mb-6">
            <img src={team.logo} alt={team.name} className="w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-lg" />
            <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">{team.name}</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Découvrez tous les produits officiels {team.name}. Maillots, tenues d'entraînement et accessoires.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gold-500">
            <Loader className="animate-spin mr-2" size={32} /> Chargement...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md text-center">{error}</div>
        ) : teamProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Aucun produit disponible pour cette équipe pour le moment.</p>
            <Link to="/" className="text-gold-500 hover:underline">Retour à l'accueil</Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black uppercase text-white border-l-4 pl-4" style={{ borderColor: team.color }}>
                Tous les Produits {categoryName}
              </h2>
              {isAdmin && (
                <button onClick={() => { setEditProduct(null); setFormOpen(true); }} className="flex items-center gap-1 text-gold-500 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                  <Plus size={18} /> Ajouter
                </button>
              )}
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
            >
              {teamProducts.map((product) => (
                <motion.div key={product._id} variants={itemVariants} className="group relative overflow-hidden bg-black/60 backdrop-blur-sm rounded-lg flex flex-col h-full border border-white/10 hover:border-green-500 transition-colors">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <button onClick={() => { setEditProduct(product); setFormOpen(true); }} className="p-1.5 bg-blue-500/80 text-white rounded hover:bg-blue-600 transition-colors"><Edit3 size={14} /></button>
                      <button onClick={() => setConfirmDelete(product._id)} className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  )}
                  <Link to={`/product/${product._id}`} className="aspect-[4/5] overflow-hidden bg-gray-800 flex-shrink-0">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: team.color }}>{team.name}</div>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-white text-xl font-semibold mb-3 group-hover:text-gold-500 transition-colors break-words">{product.name}</h3>
                    </Link>
                    <div className="mt-auto flex justify-between items-center gap-2">
                      {product.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-sm whitespace-nowrap">{product.price} MAD</span>
                          <span className="text-gold-500 font-bold whitespace-nowrap">{product.discountPrice} MAD</span>
                        </div>
                      ) : (
                        <span className="text-white font-bold whitespace-nowrap">{product.price} MAD</span>
                      )}
                      <button 
                        onClick={(e) => {
                          if (!userInfo) { setShowAuthConfirm(true); return; }
                          setCartBtnRect(e.currentTarget.getBoundingClientRect());
                          setPendingCart({
                           product: product._id,
                           name: product.name,
                           image: product.images[0],
                           price: product.discountPrice || product.price,
                           quantity: 1,
                           size: product.sizes.length > 0 ? product.sizes[0].size : 'N/D'
                          });
                        }}
                        className="bg-white text-black px-4 py-2 text-xs font-bold uppercase hover:bg-gold-500 transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
      <ProductFormModal
        show={formOpen}
        onClose={() => setFormOpen(false)}
        product={editProduct ? editProduct : { category: teamId }}
        onSaved={refresh}
      />

      <ConfirmModal
        show={confirmDelete !== null}
        title="Supprimer le produit"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer ce produit ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <ConfirmModal
        show={pendingCart !== null}
        title="Ajouter au panier"
        message={`Voulez-vous ajouter ${pendingCart?.name} à votre panier ?`}
        confirmText="Ajouter"
        cancelText="Annuler"
        onConfirm={() => { if (pendingCart && cartBtnRect) triggerFly(pendingCart.image, cartBtnRect); addToCart(pendingCart); setPendingCart(null); setCartBtnRect(null); }}
        onCancel={() => setPendingCart(null)}
      />

      <ConfirmModal
        show={showAuthConfirm}
        title="Connexion requise"
        message="Vous devez être connecté pour ajouter des produits à votre panier."
        confirmText="Se connecter"
        cancelText="Annuler"
        onConfirm={() => { setShowAuthConfirm(false); navigate('/login'); }}
        onCancel={() => setShowAuthConfirm(false)}
      />
    </div>
  );
};

export default TeamStore;
