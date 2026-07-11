import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Plus, Edit3, Trash2 } from 'lucide-react';
import useProductStore from '../store/useProductStore';
import useCartStore from '../store/useCartStore';
import useCartAnimation from '../store/useCartAnimation';
import ConfirmModal from '../components/ConfirmModal';
import useAuthStore from '../store/useAuthStore';
import ProductFormModal from '../components/ProductFormModal';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) return {};
  return { Authorization: `Bearer ${JSON.parse(info).token}` };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const NationalTeam = () => {
  const navigate = useNavigate();
  const { products, loading, error, fetchProducts } = useProductStore();
  const { addToCart } = useCartStore();
  const { trigger: triggerFly } = useCartAnimation();
  const { userInfo } = useAuthStore();
  const isAdmin = userInfo?.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [targetCategory, setTargetCategory] = useState('national');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [pendingCart, setPendingCart] = useState(null);
  const [showAuthConfirm, setShowAuthConfirm] = useState(false);
  const [cartBtnRect, setCartBtnRect] = useState(null);

  useEffect(() => {
    fetchProducts('national', { all: 'true' });
  }, [fetchProducts]);

  const refresh = useCallback(() => fetchProducts('national', { all: 'true' }), [fetchProducts]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/products/${confirmDelete}`, { headers: getAuthHeaders() });
      setConfirmDelete(null);
      refresh();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const openCreate = (cat) => {
    setTargetCategory(cat);
    setEditProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const nationalProducts = products.filter(p => p.category === 'national');

  const jerseys = nationalProducts.filter(p => p.type === 'jersey');
  const tshirts = nationalProducts.filter(p => p.type === 't-shirt');
  const bottoms = nationalProducts.filter(p => ['pants', 'shorts'].includes(p.type));
  const outerwear = nationalProducts.filter(p => ['jacket', 'hoodie'].includes(p.type));
  const tracksuits = nationalProducts.filter(p => p.type === 'tracksuit');
  const accessories = nationalProducts.filter(p => p.type === 'accessory');

  const sectionConfig = {
    'Match Kits': { borderColor: '#ef4444' },
    'T-shirts & Tops': { borderColor: '#3b82f6' },
    'Pants & Shorts': { borderColor: '#22c55e' },
    'Jackets & Hoodies': { borderColor: '#eab308' },
    'Tracksuits': { borderColor: '#06b6d4' },
    'Accessories': { borderColor: '#a855f7' },
  };

  const sections = [
    { title: 'Match Kits', items: jerseys },
    { title: 'T-shirts & Tops', items: tshirts },
    { title: 'Pants & Shorts', items: bottoms },
    { title: 'Jackets & Hoodies', items: outerwear },
    { title: 'Tracksuits', items: tracksuits },
    { title: 'Accessories', items: accessories },
  ];

  return (
    <div className="min-h-screen">
      <div className="relative pt-32 pb-24 px-6 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-black to-green-600/20 opacity-50"></div>
        <div className="container mx-auto relative z-10 text-center">
          <span className="text-gold-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Official Collection 2026</span>
          <h1 className="text-5xl md:text-7xl font-black uppercase text-white tracking-tighter mb-6">
            Équipe Nationale
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez la collection complète des Lions de l'Atlas. Des maillots match aux accessoires supporters, tout pour représenter le Maroc.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        {isAdmin && (
          <div className="mb-10 flex justify-end">
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openCreate('national')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-gold-500 text-black px-6 py-3 rounded-lg font-black uppercase tracking-widest text-sm hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300"
            >
              <Plus size={18} strokeWidth={3} /> Ajouter un produit
            </motion.button>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gold-500">
            <Loader className="animate-spin mr-2" size={32} /> Chargement de la collection...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md text-center">{error}</div>
        ) : (
          <>
            {sections.map(section => (
              <div key={section.title} className="mb-16">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase text-white border-l-4 pl-4" style={{ borderColor: sectionConfig[section.title]?.borderColor || '#ef4444' }}>{section.title}</h2>
                  {isAdmin && (
                    <button onClick={() => openCreate('national')} className="flex items-center gap-1 text-gold-500 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                      <Plus size={18} /> Ajouter
                    </button>
                  )}
                </div>
                {section.items.length === 0 ? (
                  <p className="text-gray-400 text-sm italic">Aucun produit dans cette section.</p>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
                  >
                    {section.items.map((product) => (
                      <motion.div key={product._id} variants={itemVariants} className="group relative overflow-hidden bg-black/60 backdrop-blur-sm rounded-lg flex flex-col h-full border border-white/10 hover:border-red-500 transition-colors">
                        {isAdmin && (
                          <div className="absolute top-2 right-2 z-10 flex gap-1">
                            <button onClick={() => openEdit(product)} className="p-1.5 bg-blue-500/80 text-white rounded hover:bg-blue-600 transition-colors"><Edit3 size={14} /></button>
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
                          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">
                            {product.version === 'player' ? 'Version Joueur' : product.version === 'fan' ? 'Version Fan' : product.season}
                          </div>
                          <Link to={`/product/${product._id}`}>
                            <h3 className="text-white text-xl font-semibold mb-3 group-hover:text-gold-500 transition-colors break-words">{product.name}</h3>
                          </Link>
                          <div className="mt-auto flex justify-between items-center gap-2">
                            <div>
                              {product.discountPrice ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 line-through text-sm whitespace-nowrap">{product.price} MAD</span>
                                  <span className="text-gold-500 font-bold whitespace-nowrap">{product.discountPrice} MAD</span>
                                </div>
                              ) : (
                                <span className="text-white font-bold whitespace-nowrap">{product.price} MAD</span>
                              )}
                            </div>
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
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <ProductFormModal
        show={formOpen}
        onClose={() => setFormOpen(false)}
        product={editProduct ? { ...editProduct, category: targetCategory } : { category: targetCategory }}
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

export default NationalTeam;
