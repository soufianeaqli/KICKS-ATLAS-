import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, FileQuestion, Truck, Package, Mail } from 'lucide-react';

const Help = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-12 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter">Aide</h1>
          <p className="text-gray-300 mt-4 max-w-xl mx-auto">Tout ce que vous devez savoir sur Atlas Kicks.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: <FileQuestion size={32} />, title: 'FAQ', desc: 'Réponses aux questions les plus fréquentes.', link: '/faq' },
            { icon: <Truck size={32} />, title: 'Livraison & Retours', desc: 'Délais, tarifs et politique de retour.', link: '/delivery-returns' },
            { icon: <Package size={32} />, title: 'Suivi de commande', desc: 'Suivez votre commande en temps réel.', link: '/order-tracking' },
            { icon: <Mail size={32} />, title: 'Contactez-nous', desc: 'Besoin d\'aide ? Envoyez-nous un message.', link: '/contact' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={item.link}
                className="block bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-gold-500/50 transition-all group"
              >
                <div className="text-gold-500 mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
