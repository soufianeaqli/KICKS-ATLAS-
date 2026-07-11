import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, ChevronRight, Plus, Edit3, Trash2 } from 'lucide-react';
import useProductStore from '../store/useProductStore';
import useAuthStore from '../store/useAuthStore';
import ProductFormModal from '../components/ProductFormModal';
import ConfirmModal from '../components/ConfirmModal';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const info = localStorage.getItem('userInfo');
  if (!info) return {};
  return { Authorization: `Bearer ${JSON.parse(info).token}` };
};

const botolaTeams = [
  { id: 'raja', name: 'Raja CA', city: 'Casablanca', stadium: 'Stade Mohammed V', color: '#006233', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/raja-ca.ba14aabe.png' },
  { id: 'wydad', name: 'Wydad AC', city: 'Casablanca', stadium: 'Stade Mohammed V', color: '#c8102e', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/wydad-ac.9c5c1dee.png' },
  { id: 'asfar', name: 'AS FAR', city: 'Rabat', stadium: 'Stade Moulay El Hassan', color: '#dc2626', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/as-far.5362ee4c.png' },
  { id: 'rsberkane', name: 'RS Berkane', city: 'Berkane', stadium: 'Stade Municipal de Berkane', color: '#f97316', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/rs-berkane.fd6e0977.png' },
  { id: 'fus', name: 'FUS Rabat', city: 'Rabat', stadium: 'Stade Moulay El Hassan', color: '#b91c1c', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/fus-rabat.7968471e.png' },
  { id: 'mas', name: 'MAS Fès', city: 'Fès', stadium: 'Stade de Fès', color: '#15803d', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/maghreb-of-fez.428657b6.png' },
  { id: 'dhj', name: 'DH El Jadida', city: 'El Jadida', stadium: 'Stade El Abdi', color: '#1d4ed8', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/dh-jadida.2b3dbbcd.png' },
  { id: 'tanger', name: 'IR Tanger', city: 'Tanger', stadium: 'Stade Ibn Batouta', color: '#38bdf8', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/ir-tanger.ba2e8bfb.png' },
  { id: 'codm', name: 'COD Meknès', city: 'Meknès', stadium: 'Stade d\'Honneur', color: '#eab308', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/cod-meknes.c426f303.png' },
  { id: 'ocs', name: 'OC Safi', city: 'Safi', stadium: 'Stade El Massira', color: '#a855f7', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/olympic-club-safi.63df01bb.png' },
  { id: 'husa', name: 'Hassania Agadir', city: 'Agadir', stadium: 'Stade Adrar', color: '#0ea5e9', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/hassania-agadir.fc71e44b.png' },
  { id: 'kacm', name: 'KAC Marrakech', city: 'Marrakech', stadium: 'Stade de Marrakech', color: '#e11d48', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/kac-marrakech.b1f2b06a.png' },
  { id: 'ody', name: 'Olympique Dcheira', city: 'Dcheira', stadium: 'Stade Municipal', color: '#22d3ee', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/olympique-dcheira.4620562f.png' },
  { id: 'rcaz', name: 'RCA Zemamra', city: 'Zemamra', stadium: 'Stade Municipal', color: '#16a34a', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/rca-zemamra.7a883e86.png' },
  { id: 'uts', name: 'UTS Rabat', city: 'Rabat', stadium: 'Stade Moulay El Hassan', color: '#84cc16', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/uts-rabat.f1cf445b.png' },
  { id: 'usym', name: 'US Yacoub El Mansour', city: 'Rabat', stadium: 'Stade Yacoub El Mansour', color: '#64748b', logo: 'https://assets.football-logos.cc/logos/morocco/1500x1500/union-yacoub-el-mansour.952f12dc.png' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const Botola = () => {
  const { products, loading, error, fetchProducts } = useProductStore();
  const { userInfo } = useAuthStore();
  const isAdmin = userInfo?.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editTeamId, setEditTeamId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchProducts('', { all: 'true' });
  }, [fetchProducts]);

  const refresh = useCallback(() => fetchProducts('', { all: 'true' }), [fetchProducts]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/products/${confirmDelete}`, { headers: getAuthHeaders() });
      setConfirmDelete(null);
      refresh();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const botolaProducts = products.filter(p => p.category !== 'national' && p.type === 'jersey');
  const getTeamProduct = (teamId) => botolaProducts.find(p => p.category === teamId);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative pt-32 pb-24 px-6 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #15803d, #0f1115)' }}></div>
        <div className="container mx-auto relative z-10 text-center">
          <span className="text-green-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Botola Pro Inwi</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter mb-4">
            Store des Clubs
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Découvrez les maillots et produits officiels de tous les clubs de la première division marocaine.
          </p>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gold-500">
            <Loader className="animate-spin mr-2" size={32} /> Chargement...
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md text-center">{error}</div>
        ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
              >
            {botolaTeams.map((team) => {
              const product = getTeamProduct(team.id);
              return (
                <motion.div key={team.id} variants={itemVariants} className="group relative overflow-hidden bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 hover:border-green-500 transition-all duration-300 flex flex-col">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                      <button onClick={(e) => { e.preventDefault(); setEditTeamId(team.id); setEditProduct(null); setFormOpen(true); }} className="p-1.5 bg-gold-500/80 text-black rounded hover:bg-gold-500 transition-colors" title="Ajouter un produit"><Plus size={14} /></button>
                    </div>
                  )}
                  <Link to={`/team/${team.id}`}>
                    <div className="h-2" style={{ backgroundColor: team.color }}></div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white text-xl font-bold group-hover:text-gold-500 transition-colors">{team.name}</h3>
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center p-1">
                          <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <div className="space-y-1 text-gray-400 text-sm mb-4">
                        <p>{team.city}</p>
                        <p className="text-xs">{team.stadium}</p>
                      </div>
                      {product ? (
                        <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 group-hover:bg-gray-700 transition-colors">
                          <div className="w-12 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold break-words">{product.name}</p>
                            <p className="text-gold-500 text-sm font-bold whitespace-nowrap">{product.price} MAD</p>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-1 shrink-0">
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditTeamId(team.id); setEditProduct(product); setFormOpen(true); }} className="p-1 bg-blue-500/80 text-white rounded hover:bg-blue-600"><Edit3 size={12} /></button>
                              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(product._id); }} className="p-1 bg-red-500/80 text-white rounded hover:bg-red-600"><Trash2 size={12} /></button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-xs italic">Boutique à venir</div>
                      )}
                      <div className="mt-4 flex items-center justify-center text-green-500 text-xs font-bold uppercase tracking-widest group-hover:gap-2 transition-all">
                        Voir le store <ChevronRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      <ProductFormModal
        show={formOpen}
        onClose={() => setFormOpen(false)}
        product={editProduct ? editProduct : { category: editTeamId }}
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
    </div>
  );
};

export default Botola;
