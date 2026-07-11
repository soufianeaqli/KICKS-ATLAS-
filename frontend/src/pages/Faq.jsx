import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'Quels sont les délais de livraison ?', r: 'La livraison prend généralement 3 à 7 jours ouvrés au Maroc. Les commandes vers l\'international peuvent prendre 10 à 15 jours ouvrés.' },
  { q: 'Puis-je retourner un produit ?', r: 'Oui, vous disposez de 14 jours après réception pour retourner un produit en parfait état, non porté et dans son emballage d\'origine.' },
  { q: 'Comment suivre ma commande ?', r: 'Une fois votre commande expédiée, vous recevrez un email avec un numéro de suivi. Vous pouvez aussi suivre votre commande depuis la page Suivi de commande.' },
  { q: 'Quels moyens de paiement acceptez-vous ?', r: 'Nous acceptons les paiements par carte bancaire (Visa, Mastercard) et à la livraison (COD) dans certaines villes du Maroc.' },
  { q: 'Les maillots sont-ils authentiques ?', r: 'Oui, tous nos produits sont authentiques et certifiés. Nous travaillons directement avec les fournisseurs officiels.' },
  { q: 'Puis-je annuler ma commande ?', r: 'Vous pouvez annuler votre commande tant qu\'elle n\'a pas été expédiée. Contactez-nous dès que possible après votre achat.' },
  { q: 'Proposez-vous des réductions pour les membres VIP ?', r: 'Oui, les membres VIP Atlas bénéficient de réductions exclusives et d\'un accès prioritaire aux nouvelles collections. Consultez la page Challenges pour plus d\'informations.' },
  { q: 'Comment contacter le service client ?', r: 'Vous pouvez nous contacter par email à Soufianeaqli20@gmail.com, par téléphone au +212 679224411, ou via le formulaire de contact.' },
];

const Faq = () => {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">FAQ</h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">Questions fréquemment posées.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-white font-bold hover:bg-white/5 transition-colors"
              >
                <span>{faq.q}</span>
                {open === i ? <ChevronUp size={20} className="text-gold-500 shrink-0" /> : <ChevronDown size={20} className="text-gray-500 shrink-0" />}
              </button>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 text-gray-300 text-sm leading-relaxed"
                >
                  {faq.r}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
