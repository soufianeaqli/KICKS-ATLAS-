import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import ConfirmModal from '../components/ConfirmModal';
import { Gift, Crown } from 'lucide-react';
import { API_URL } from '../config';

const API = API_URL;

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, clearFreeGift, getFreeGift } = useCartStore();
  const { userInfo } = useAuthStore();

  // freeGift is the cart item that has isFreeGift=true
  const freeGift = getFreeGift();
  const regularItems = cartItems.filter(x => !x.isFreeGift);

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'Morocco'
  });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const [vipStatus, setVipStatus] = useState(null);

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    if (cartItems.length === 0 && !isProcessing && !orderSuccess) { navigate('/cart'); return; }
  }, [userInfo, navigate]);

  useEffect(() => {
    if (!userInfo) return;
    axios.get(`${API}/vip/me`, { headers: { Authorization: `Bearer ${userInfo.token}` } })
      .then(({ data }) => setVipStatus(data))
      .catch(() => {});
  }, [userInfo]);

  const itemsPrice = regularItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const shippingPrice = 50;
  const vipDiscountPercent = vipStatus?.isVip ? (vipStatus.config?.discountPercent || 15) : 0;
  const vipDiscountAmount = vipStatus?.isVip ? (itemsPrice * vipDiscountPercent / 100) : 0;
  const totalPrice = Math.max(0, itemsPrice + shippingPrice - vipDiscountAmount);

  const handlePlaceOrderClick = () => {
    setFormError('');
    if (!shippingAddress.address.trim()) { setFormError('Veuillez entrer votre adresse.'); return; }
    if (!shippingAddress.city.trim()) { setFormError('Veuillez entrer votre ville.'); return; }
    if (!shippingAddress.postalCode.trim()) { setFormError('Veuillez entrer votre code postal.'); return; }
    setShowConfirm(true);
  };

  const placeOrder = async () => {
    setShowConfirm(false);
    if (!userInfo) { navigate('/login'); return; }
    setIsProcessing(true);
    try {
      await axios.post(`${API}/orders`, {
        orderItems: regularItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image,
          price: item.price,
          size: item.size,
          product: item.product,
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice: 0,
        shippingPrice,
        totalPrice,
        giftItem: freeGift ? {
          name: freeGift.name,
          image: freeGift.image,
          product: freeGift.product,
        } : undefined,
        vipDiscount: vipStatus?.isVip ? {
          applied: true,
          percent: vipDiscountPercent,
          discountAmount: vipDiscountAmount,
        } : undefined,
      }, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      clearCart();
      setIsProcessing(false);
      setOrderSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la commande');
      if (err.response?.status === 400 && err.response?.data?.message?.includes('déjà réclamé')) {
        clearFreeGift();
      }
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (orderSuccess) {
      const timer = setTimeout(() => navigate('/myorders'), 6000);
      return () => clearTimeout(timer);
    }
  }, [orderSuccess]);

  if (!userInfo) return null;
  if (cartItems.length === 0 && !orderSuccess && !isProcessing) return null;

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-8">VALIDATION DE LA COMMANDE</h1>

        {vipStatus?.isVip && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/40 to-amber-900/40 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <Crown size={24} className="text-yellow-400" />
              <div>
                <p className="font-bold text-yellow-400 uppercase tracking-wider text-sm">Réduction VIP Active</p>
                <p className="text-gray-400 text-xs">{vipDiscountPercent}% de réduction — économisez {vipDiscountAmount.toFixed(2)} MAD ({vipStatus.remainingDays} jours restants)</p>
              </div>
            </div>
          </div>
        )}


        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full lg:w-2/3 bg-black/60 backdrop-blur-sm p-6 md:p-8 rounded-lg border border-white/10"
          >
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-6">Informations de Livraison</h2>
            <form id="checkout-form">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Adresse</label>
                  <input type="text" required className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none focus:border-green-500" 
                    value={shippingAddress.address} onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Ville</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none focus:border-green-500" 
                      value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Code Postal</label>
                    <input type="text" required className="w-full bg-black/40 border border-white/10 text-white rounded p-3 focus:outline-none focus:border-green-500" 
                      value={shippingAddress.postalCode} onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Pays</label>
                  <input type="text" required className="w-full bg-gray-800 border border-gray-700 text-white rounded p-3 text-gray-500 bg-opacity-50" 
                    value={shippingAddress.country} disabled />
                </div>
              </div>

              <h2 className="text-2xl font-bold uppercase tracking-widest mb-6 mt-10 border-t border-gray-800 pt-8">Mode de Paiement</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 bg-black/40 p-4 border border-white/10 rounded cursor-pointer hover:border-green-500 transition-colors">
                  <input type="radio" name="payment" checked={paymentMethod === 'Credit Card (Stripe)'} onChange={() => setPaymentMethod('Credit Card (Stripe)')} className="accent-gold-500 w-5 h-5" />
                  <span className="font-bold">Carte Bancaire (Stripe)</span>
                </label>
                <label className="flex items-center gap-3 bg-black/40 p-4 border border-white/10 rounded cursor-pointer hover:border-green-500 transition-colors">
                  <input type="radio" name="payment" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} className="accent-gold-500 w-5 h-5" />
                  <span className="font-bold">Paiement à la Livraison</span>
                </label>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full lg:w-1/3"
          >
            <div className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border border-white/10 sticky top-28">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-4 border-b border-gray-800 pb-4">Récapitulatif</h2>
              
              <div className="space-y-3 mb-6 text-sm">
                {cartItems.map((item, index) => (
                  <div key={index} className={`flex justify-between items-center ${item.isFreeGift ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="break-words pr-2 flex items-center gap-1.5">
                      {item.isFreeGift && <Gift size={12} className="shrink-0" />}
                      {item.quantity}x {item.name}
                      {item.isFreeGift && <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded font-bold uppercase">OFFERT</span>}
                    </span>
                    <span className="shrink-0 font-bold whitespace-nowrap">{item.isFreeGift ? '0.00 MAD' : `${(item.price * item.quantity).toFixed(2)} MAD`}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2 text-sm font-semibold">
                <div className="flex justify-between"><span>Sous-total</span><span className="whitespace-nowrap">{itemsPrice.toFixed(2)} MAD</span></div>
                {freeGift && (
                  <div className="flex justify-between text-green-400"><span>🎁 Cadeau offert</span><span className="whitespace-nowrap">0.00 MAD</span></div>
                )}
                {vipStatus?.isVip && (
                  <div className="flex justify-between text-yellow-400"><span>VIP -{vipDiscountPercent}%</span><span className="whitespace-nowrap">-{vipDiscountAmount.toFixed(2)} MAD</span></div>
                )}
                <div className="flex justify-between text-gray-400"><span>Livraison</span><span className="whitespace-nowrap">{shippingPrice.toFixed(2)} MAD</span></div>
                <div className="flex justify-between text-lg font-bold text-gold-500 mt-4 pt-4 border-t border-gray-800">
                  <span>Total</span><span className="whitespace-nowrap">{totalPrice.toFixed(2)} MAD</span>
                </div>
              </div>

              {formError && (
                <div className="mt-4 text-red-400 text-xs font-semibold bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
                  ⚠️ {formError}
                </div>
              )}
              <motion.button
                type="button"
                onClick={handlePlaceOrderClick}
                disabled={isProcessing}
                whileHover={isProcessing ? {} : { scale: 1.02 }}
                whileTap={isProcessing ? {} : { scale: 0.98 }}
                className={`w-full mt-4 py-4 uppercase font-black tracking-widest transition-colors ${
                  isProcessing ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gold-500 text-white hover:bg-white hover:text-black'
                }`}
              >
                {isProcessing ? 'Traitement en cours...' : 'Confirmer la commande'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-bold uppercase tracking-wider">Traitement de votre commande...</p>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        title="Confirmer la commande"
        message={`Voulez-vous confirmer votre commande d'un montant de ${totalPrice.toFixed(2)} MAD ?`}
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={placeOrder}
        onCancel={() => setShowConfirm(false)}
      />

      {orderSuccess && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.3 }}
              className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]"
            >
              <motion.svg
                width="48" height="48" viewBox="0 0 48 48" fill="none"
              >
                <motion.path
                  d="M10 24L20 34L38 14"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </motion.svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-2xl font-black text-white uppercase tracking-widest mb-2"
            >
              Commande Confirmée !
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="text-gray-400 text-sm mb-8 text-center max-w-xs"
            >
              Votre achat a été enregistré avec succès.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 }}
              className="w-56"
            >
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.5, delay: 2.0, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-green-500 to-gold-500 rounded-full"
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="text-center text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold"
              >
                Redirection vers vos commandes...
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Checkout;
