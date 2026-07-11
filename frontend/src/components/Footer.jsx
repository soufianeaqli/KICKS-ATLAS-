import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/70 text-gray-400 border-t border-gray-800 pt-16 pb-8">
      <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-4">
            <span className="text-red-600">Atlas</span> Kicks
          </h2>
          <p className="text-sm">La destination ultime pour la mode du football marocain. Équipements officiels, maillots et collections premium.</p>
        </div>

        <div>
          <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Boutique</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/national-team" className="hover:text-gold-500 transition-colors">Équipe Nationale</Link></li>
            <li><Link to="/botola" className="hover:text-gold-500 transition-colors">Botola Pro</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Aide</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help" className="hover:text-gold-500 transition-colors">Aide</Link></li>
            <li><Link to="/faq" className="hover:text-gold-500 transition-colors">FAQ</Link></li>
            <li><Link to="/delivery-returns" className="hover:text-gold-500 transition-colors">Livraison & Retours</Link></li>
            <li><Link to="/order-tracking" className="hover:text-gold-500 transition-colors">Suivi de commande</Link></li>
            <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Contactez-nous</Link></li>
          </ul>
        </div>

      </div>

      <div className="container mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center">
        <p>&copy; {new Date().getFullYear()} Atlas Kicks. Tous droits réservés.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link to="/terms" className="hover:text-gold-500 transition-colors">Conditions Générales</Link>
          <span className="text-gray-700">|</span>
          <Link to="/privacy" className="hover:text-gold-500 transition-colors">Politique de Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
