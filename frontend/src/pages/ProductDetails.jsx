import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Truck, Shield, Star, MessageSquare } from 'lucide-react';
import axios from 'axios';
import useProductStore from '../store/useProductStore';
import useCartStore from '../store/useCartStore';
import useCartAnimation from '../store/useCartAnimation';
import useAuthStore from '../store/useAuthStore';
import ConfirmModal from '../components/ConfirmModal';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

const API = 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [showCartConfirm, setShowCartConfirm] = useState(false);
  const [showAuthConfirm, setShowAuthConfirm] = useState(false);
  const [cartBtnRect, setCartBtnRect] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewImages, setReviewImages] = useState([]);

  const { product, loading, error, fetchProductById } = useProductStore();
  const { addToCart } = useCartStore();
  const { trigger: triggerFly } = useCartAnimation();
  const { userInfo } = useAuthStore();

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].size);
    }
  }, [product]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`${API}/reviews/product/${id}?sort=${reviewSort}`);
      setReviews(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, reviewSort]);

  const addToCartHandler = (e) => {
    if (!userInfo) { setShowAuthConfirm(true); return; }
    setCartBtnRect(e.currentTarget.getBoundingClientRect());
    setShowCartConfirm(true);
  };

  const confirmAddToCart = () => {
    setShowCartConfirm(false);
    if (cartBtnRect) triggerFly(product.images[0], cartBtnRect);
    addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: qty,
      size: selectedSize,
    });
    setCartBtnRect(null);
    navigate('/cart');
  };

  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  };

  if (loading) return <div className="min-h-screen pt-24 text-gold-500 text-center">Chargement...</div>;
  if (error) return <div className="min-h-screen pt-24 text-red-500 text-center">{error}</div>;
  if (!product) return <div className="min-h-screen pt-24 text-white text-center">Produit non trouvé</div>;

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const photoReviews = reviews.filter(r => r.photos && r.photos.length > 0);

  return (
    <div className="pt-24 pb-16 min-h-screen text-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors uppercase text-sm tracking-widest font-bold mb-8">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

          <div className="flex flex-col md:flex-row gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full md:w-1/2 flex gap-4"
          >
            <div className="w-full aspect-[4/5] bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-full md:w-1/2 flex flex-col"
          >
            {product.isLimitedEdition && (
               <span className="bg-red-600 text-white px-3 py-1 uppercase font-bold text-xs inline-block w-max rounded-sm mb-4">Édition Limitée</span>
            )}
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">{product.name}</h1>
            <p className="text-xl text-gray-400 mb-6 font-semibold uppercase tracking-wider">{product.category} • {product.brand}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-gray-600'} fill={star <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-gray-400 text-sm">{avgRating} ({reviews.length} avis)</span>
            </div>

            <p className="text-gold-500 text-3xl font-bold mb-8 whitespace-nowrap">{product.price} MAD</p>

            <p className="text-gray-300 leading-relaxed mb-8 border-b border-gray-800 pb-8">
              {product.description}
            </p>

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="uppercase tracking-widest text-sm font-bold mb-3">Choisir la Taille</h3>
                <div className="flex gap-3">
                  {product.sizes.map((s, index) => (
                    <button 
                      key={index} 
                      onClick={() => setSelectedSize(s.size)}
                      className={`w-12 h-12 flex items-center justify-center border font-bold uppercase transition-all duration-200 
                        ${selectedSize === s.size 
                          ? 'border-gold-500 bg-gold-500 text-white' 
                          : 'border-gray-600 hover:border-white'}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <h3 className="uppercase tracking-widest text-sm font-bold mb-3">Quantité</h3>
              <div className="flex items-center border border-gray-600 w-max">
                <button 
                  onClick={() => setQty(qty > 1 ? qty - 1 : 1)} 
                  className="px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold w-12 text-center">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)} 
                  className="px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <motion.button
              onClick={addToCartHandler}
              disabled={!product.inStock}
              whileHover={product.inStock ? { scale: 1.02 } : {}}
              whileTap={product.inStock ? { scale: 0.98 } : {}}
              className={`w-full py-4 text-center font-bold uppercase tracking-widest transition-all duration-300 ${
                product.inStock 
                  ? 'bg-white text-black hover:bg-gold-500 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
            </motion.button>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Check size={18} className="text-green-500" /> <span className="uppercase tracking-wide">Équipement Officiel Authentique</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Truck size={18} className="text-gray-300" /> <span className="uppercase tracking-wide">Livraison offerte partout au Maroc</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Shield size={18} className="text-gray-300" /> <span className="uppercase tracking-wide">Paiement sécurisé via Stripe</span>
              </div>
            </div>

          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-20 border-t border-gray-800 pt-12"
        >
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
            <MessageSquare size={24} className="text-gold-500" /> Avis Clients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6 text-center">
              <p className="text-5xl font-black text-gold-500 mb-2">{avgRating}</p>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= Math.round(Number(avgRating)) ? 'text-yellow-400' : 'text-gray-600'} fill={star <= Math.round(Number(avgRating)) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-gray-500 text-sm">{reviews.length} avis</p>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                <p className="text-sm font-bold uppercase tracking-widest mb-3">Répartition des Notes</p>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const dist = getRatingDistribution();
                  const count = dist[star] || 0;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 w-3 text-right">{star}</span>
                      <Star size={12} className="text-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-gray-500 text-xs w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {photoReviews.length > 0 && (
              <div className="bg-gray-900/40 border border-gray-800/50 rounded-xl p-6">
                <p className="text-sm font-bold uppercase tracking-widest mb-3">Photos des Clients ({photoReviews.length})</p>
                <div className="flex gap-2 flex-wrap">
                  {photoReviews.slice(0, 6).map((review, i) =>
                    review.photos?.map((photo, j) => (
                      <a key={`${i}-${j}`} href={photo} target="_blank" rel="noopener noreferrer"
                        className="w-14 h-14 rounded-lg overflow-hidden border border-gray-700 hover:border-gold-500 transition-colors">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ReviewList reviews={reviews} sortBy={reviewSort} onSortChange={setReviewSort} />
            </div>
            <div>
              {userInfo ? (
                showReviewForm ? (
                  <ReviewForm productId={id} userInfo={userInfo} onReviewSubmitted={() => { setShowReviewForm(false); fetchReviews(); }} />
                ) : (
                  <button onClick={() => setShowReviewForm(true)}
                    className="w-full py-4 bg-gold-500 text-black font-black uppercase tracking-widest hover:bg-white transition-colors">
                    Écrire un avis
                  </button>
                )
              ) : (
                <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">Connectez-vous pour écrire un avis</p>
                  <Link to="/login" className="inline-block py-3 px-8 bg-gold-500 text-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors">Connexion</Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        show={showCartConfirm}
        title="Ajouter au panier"
        message={`Voulez-vous ajouter ${product?.name} (x${qty}) à votre panier ?`}
        confirmText="Ajouter"
        cancelText="Annuler"
        onConfirm={confirmAddToCart}
        onCancel={() => setShowCartConfirm(false)}
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

export default ProductDetails;
