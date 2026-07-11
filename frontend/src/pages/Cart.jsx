import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, Gift } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import ConfirmModal from '../components/ConfirmModal';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, addToCart, clearFreeGift, getFreeGift } = useCartStore();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const freeGift = getFreeGift();
  const regularItems = cartItems.filter(x => !x.isFreeGift);

  const updateQuantity = (item, newQuantity) => {
    if (newQuantity >= 1) {
      addToCart({ ...item, quantity: newQuantity });
    }
  };

  const subtotal = regularItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const shipping = cartItems.length > 0 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-8">Votre Panier</h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-center">
            <ShoppingBag size={64} className="text-gray-600 mb-6" />
            <h2 className="text-2xl uppercase tracking-widest font-bold mb-4">Votre panier est vide</h2>
            <p className="text-gray-400 mb-8 max-w-md">Découvrez nos collections de football marocain authentiques.</p>
            <Link to="/" className="bg-gold-500 text-white px-8 py-3 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm">
              Commencer mes achats
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 border-t border-gray-800 pt-8">
            <div className="w-full lg:w-2/3">
              <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={`${item.product}-${item.isFreeGift ? 'gift' : item.size}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex flex-col sm:flex-row items-center gap-6 py-6 border-b ${item.isFreeGift ? 'border-green-800 bg-green-900/10 rounded-xl px-4 mb-2' : 'border-gray-800'}`}
                >
                  <div className={`w-24 h-32 bg-black/60 rounded overflow-hidden flex-shrink-0 border ${item.isFreeGift ? 'border-green-500/40' : 'border-white/10'}`}>
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-grow flex flex-col w-full text-center sm:text-left">
                    {item.isFreeGift && (
                      <div className="flex items-center gap-2 mb-1">
                        <Gift size={14} className="text-green-400" />
                        <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Cadeau gratuit — Offert</span>
                      </div>
                    )}
                    <Link to={`/product/${item.product}`} className={`text-xl font-bold uppercase hover:text-gold-500 transition-colors break-words ${item.isFreeGift ? 'text-green-300' : ''}`}>
                      {item.name}
                    </Link>
                    {item.size && <p className="text-gray-400 text-sm mt-1 uppercase">Taille: {item.size}</p>}
                    <p className={`font-bold mt-2 whitespace-nowrap ${item.isFreeGift ? 'text-green-400' : 'text-gold-500'}`}>
                      {item.isFreeGift ? 'GRATUIT' : `${item.price} MAD`}
                    </p>

                  </div>

                  <div className="flex items-center gap-6">
                    {!item.isFreeGift && (
                      <div className="flex items-center border border-gray-600">
                        <button onClick={() => updateQuantity(item, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-800 transition-colors">-</button>
                        <span className="px-4 py-1 font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-800 transition-colors">+</button>
                      </div>
                    )}
                    <button
                      onClick={() => setConfirmDelete(item)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-black/60 backdrop-blur-sm p-8 rounded-lg border border-white/10 sticky top-28">
                <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Récapitulatif</h2>

                <div className="space-y-4 text-sm font-semibold text-gray-300">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="whitespace-nowrap">{subtotal.toFixed(2)} MAD</span>
                  </div>
                  {freeGift && (
                    <div className="flex justify-between text-green-400">
                      <span className="flex items-center gap-1.5"><Gift size={14} /> Cadeau offert</span>
                      <span className="whitespace-nowrap">0.00 MAD</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="whitespace-nowrap">50.00 MAD</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 mt-6 pt-6 mb-8 flex justify-between text-xl font-bold uppercase">
                  <span>Total</span>
                  <span className="text-gold-500 whitespace-nowrap">{total.toFixed(2)} MAD</span>
                </div>

                <motion.button
                  onClick={() => navigate('/checkout')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-white text-black py-4 uppercase font-black tracking-widest hover:bg-gold-500 transition-colors"
                >
                  Passer la commande
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        show={!!confirmDelete}
        title={confirmDelete?.isFreeGift ? 'Retirer le cadeau' : 'Supprimer l\'article'}
        message={`Voulez-vous vraiment supprimer "${confirmDelete?.name}" du panier ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        danger
        onConfirm={() => {
          if (confirmDelete?.isFreeGift) clearFreeGift();
          else removeFromCart(confirmDelete?.product);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default Cart;
