import React from 'react';
import { motion } from 'framer-motion';
import { Truck, RotateCcw, Shield, Clock } from 'lucide-react';

const DeliveryReturns = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">Livraison &<br /><span className="text-red-600">Retours</span></h1>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {[
            { icon: <Truck size={28} />, title: 'Livraison au Maroc', items: ['Délai : 3 à 7 jours ouvrés', 'Frais : 30 MAD (gratuit dès 500 MAD)', 'Suivi inclus avec numéro de tracking'] },
            { icon: <Truck size={28} />, title: 'Livraison Internationale', items: ['Délai : 10 à 15 jours ouvrés', 'Frais : calculés selon la destination', 'Dédouanement à la charge du client'] },
            { icon: <RotateCcw size={28} />, title: 'Retours & Échanges', items: ['Délai : 14 jours après réception', 'Produit non porté, en parfait état', 'Remboursement sous 5 à 10 jours ouvrés'] },
            { icon: <Shield size={28} />, title: 'Garantie', items: ['Tous nos produits sont authentiques', 'Garantie satisfait ou remboursé', 'Service client réactif'] },
          ].map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-8"
            >
              <div className="text-gold-500 mb-4">{section.icon}</div>
              <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="text-gray-300 text-sm flex items-center gap-2">
                    <Clock size={12} className="text-gold-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-3xl mx-auto text-center"
        >
          <h3 className="text-white font-bold text-lg mb-3">Vous avez un problème ?</h3>
          <p className="text-gray-300 text-sm mb-6">Contactez notre service client et nous vous répondrons sous 24h.</p>
          <a href="mailto:Soufianeaqli20@gmail.com" className="text-gold-500 hover:text-gold-400 font-bold transition-colors">Soufianeaqli20@gmail.com</a>
        </motion.div>
      </div>
    </div>
  );
};

export default DeliveryReturns;
