import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';
import zelijPatternUrl from '../assets/moroccan_flag_zelij.png';

const API = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) return {};
  return { Authorization: `Bearer ${JSON.parse(info).token}` };
};

const emptyProduct = {
  name: '', slug: '', images: [''], description: '', brand: '', category: 'national',
  type: 'jersey', season: '2025/26', version: 'fan', price: 0, discountPrice: '',
  inStock: true, countInStock: 1, sizes: [], colors: [], isLimitedEdition: false,
};

const ProductFormModal = ({ show, onClose, product, onSaved }) => {
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (show && !initializedRef.current) {
      initializedRef.current = true;
      if (product?._id) {
        setForm({
          name: product.name || '',
          slug: product.slug || '',
          images: product.images?.length ? product.images : [''],
          description: product.description || '',
          brand: product.brand || '',
          category: product.category || 'national',
          type: product.type || 'jersey',
          season: product.season || '2025/26',
          version: product.version || 'fan',
          price: product.price || 0,
          discountPrice: product.discountPrice || '',
          inStock: product.inStock ?? true,
          countInStock: product.countInStock || 1,
          sizes: product.sizes || [],
          colors: product.colors || [],
          isLimitedEdition: product.isLimitedEdition || false,
        });
      } else {
        setForm({ ...emptyProduct, category: product?.category || 'national' });
      }
    }
    if (!show) {
      initializedRef.current = false;
    }
  }, [show, product]);

  const hc = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addImage = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  const rmImage = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  const chImage = (i, val) => setForm(prev => {
    const imgs = [...prev.images]; imgs[i] = val; return { ...prev, images: imgs };
  });

  const addSize = () => setForm(prev => ({ ...prev, sizes: [...prev.sizes, { size: '', quantity: 1 }] }));
  const rmSize = (i) => setForm(prev => ({ ...prev, sizes: prev.sizes.filter((_, idx) => idx !== i) }));
  const chSize = (i, field, val) => setForm(prev => {
    const sizes = [...prev.sizes]; sizes[i] = { ...sizes[i], [field]: field === 'quantity' ? Number(val) : val };
    return { ...prev, sizes };
  });

  const addColor = () => setForm(prev => ({ ...prev, colors: [...prev.colors, ''] }));
  const rmColor = (i) => setForm(prev => ({ ...prev, colors: prev.colors.filter((_, idx) => idx !== i) }));
  const chColor = (i, val) => setForm(prev => {
    const colors = [...prev.colors]; colors[i] = val; return { ...prev, colors };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      payload.images = payload.images.filter(i => i.trim());
      payload.price = Number(payload.price) || 0;
      payload.discountPrice = Number(payload.discountPrice) || undefined;
      payload.countInStock = Number(payload.countInStock) || 0;
      if (!payload.slug && payload.name) {
        payload.slug = payload.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (product?._id) {
        await axios.put(`${API}/products/${product._id}`, payload, { headers: getAuthHeaders() });
      } else {
        await axios.post(`${API}/products`, payload, { headers: getAuthHeaders() });
      }
      onSaved();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${zelijPatternUrl})`,
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold uppercase">{product?._id ? 'Modifier' : 'Nouveau'} Produit</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nom *</label>
              <input name="name" value={form.name} onChange={hc} required className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Slug *</label>
              <input name="slug" value={form.slug} onChange={hc} required className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Images</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={img} onChange={e => chImage(i, e.target.value)} className="flex-1 bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" placeholder="URL image" />
                {form.images.length > 1 && <button type="button" onClick={() => rmImage(i)} className="text-red-500"><X size={20} /></button>}
              </div>
            ))}
            <button type="button" onClick={addImage} className="text-gold-500 text-sm hover:underline">+ Ajouter image</button>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description *</label>
            <textarea name="description" value={form.description} onChange={hc} required rows={3} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Marque *</label>
              <input name="brand" value={form.brand} onChange={hc} required className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Catégorie *</label>
              <select name="category" value={form.category} onChange={hc} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors">
                <option value="national">Équipe Nationale</option>
                <option value="raja">Raja CA</option>
                <option value="wydad">Wydad AC</option>
                <option value="asfar">AS FAR</option>
                <option value="rsberkane">RS Berkane</option>
                <option value="fus">FUS Rabat</option>
                <option value="mas">MAS Fès</option>
                <option value="dhj">DHJ El Jadida</option>
                <option value="tanger">IRT Tanger</option>
                <option value="codm">CODM Meknès</option>
                <option value="ocs">OC Safi</option>
                <option value="husa">Hassania Agadir</option>
                <option value="kacm">KAC Marrakech</option>
                <option value="ody">Olympique Dcheira</option>
                <option value="rcaz">RCA Zemamra</option>
                <option value="uts">UTS Rabat</option>
                <option value="usym">US Yacoub El Mansour</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type *</label>
              <select name="type" value={form.type} onChange={hc} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors">
                <option value="jersey">Maillot</option>
                <option value="t-shirt">T-shirt</option>
                <option value="tracksuit">Survêtement</option>
                <option value="jacket">Veste</option>
                <option value="hoodie">Sweat</option>
                <option value="pants">Pantalon</option>
                <option value="shorts">Short</option>
                <option value="accessory">Accessoire</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Saison</label>
              <input name="season" value={form.season} onChange={hc} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Version</label>
              <select name="version" value={form.version} onChange={hc} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors">
                <option value="fan">Fan</option>
                <option value="player">Player</option>
                <option value="retro">Retro</option>
                <option value="none">Aucune</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prix *</label>
              <input name="price" type="number" value={form.price} onChange={hc} required className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prix promo</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={hc} className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stock *</label>
              <input name="countInStock" type="number" value={form.countInStock} onChange={hc} required className="w-full bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input name="inStock" type="checkbox" checked={form.inStock} onChange={hc} className="accent-gold-500" />
              <label className="text-sm text-gray-300">En stock</label>
              <input name="isLimitedEdition" type="checkbox" checked={form.isLimitedEdition} onChange={hc} className="accent-gold-500 ml-4" />
              <label className="text-sm text-gray-300">Édition limitée</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Couleurs</label>
            {form.colors.map((color, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={color} onChange={e => chColor(i, e.target.value)} className="flex-1 bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" placeholder="e.g. Rouge" />
                <button type="button" onClick={() => rmColor(i)} className="text-red-500"><X size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={addColor} className="text-gold-500 text-sm hover:underline">+ Ajouter couleur</button>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tailles</label>
            {form.sizes.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={s.size} onChange={e => chSize(i, 'size', e.target.value)} className="w-24 bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" placeholder="S, M, L..." />
                <input value={s.quantity} onChange={e => chSize(i, 'quantity', e.target.value)} type="number" className="w-24 bg-[#090a0c] border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" placeholder="Qté" />
                <button type="button" onClick={() => rmSize(i)} className="text-red-500"><X size={20} /></button>
              </div>
            ))}
            <button type="button" onClick={addSize} className="text-gold-500 text-sm hover:underline">+ Ajouter taille</button>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-white/10 text-gray-300 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-white/10 hover:text-white transition-all">Annuler</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-gold-500 text-black rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50">
              {loading ? 'Enregistrement...' : product ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;
