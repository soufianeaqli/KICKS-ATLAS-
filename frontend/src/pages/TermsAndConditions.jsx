import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Shield, ShoppingBag, Truck, RotateCcw, CreditCard, AlertTriangle } from 'lucide-react';

const sections = [
  {
    icon: <ShoppingBag size={20} />,
    title: 'Article 1 — Objet',
    content: `Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Atlas Kicks, marque de commerce spécialisée dans la mode sportive marocaine, et tout client effectuant un achat sur le site atlas-kicks.com. En passant commande sur ce site, le client reconnaît avoir pris connaissance et accepté les présentes CGV.`
  },
  {
    icon: <FileText size={20} />,
    title: 'Article 2 — Produits',
    content: `Les produits proposés à la vente sont ceux figurant sur le site atlas-kicks.com. Chaque produit est présenté avec une description détaillée comprenant ses caractéristiques essentielles, ses dimensions, sa composition ainsi qu'une ou plusieurs photographies. Les couleurs des produits peuvent varier légèrement par rapport aux photographsies en raison des paramètres d'affichage de l'écran.`
  },
  {
    icon: <CreditCard size={20} />,
    title: 'Article 3 — Prix et Paiement',
    content: `Les prix sont indiqués en Dirhams Marocains (MAD) toutes taxes comprises. Atlas Kicks se réserve le droit de modifier ses prix à tout moment, being applicable being the price in effect at the time of order validation. Le paiement s'effectue au moment de la commande par carte bancaire (Stripe) ou en paiement à la livraison. Toute commande non payée sera automatiquement annulée après un délai de 7 jours.`
  },
  {
    icon: <Truck size={20} />,
    title: 'Article 4 — Livraison',
    content: `La livraison est effectuée à l'adresse indiquée par le client lors de la commande. Les délais de livraison sont de 3 à 7 jours ouvrables sur tout le territoire marocain. Les frais de livraison sont de 50 MAD par commande. Atlas Kicks ne saurait être tenu responsable des retards de livraison dus à des circonstances indépendantes de sa volonté (intempéries, grèves, etc.). Un numéro de suivi est fourni à chaque commande pour permettre le suivi en temps réel.`
  },
  {
    icon: <RotateCcw size={20} />,
    title: 'Article 5 — Droit de Rétractation et Retours',
    content: `Conformément à la législation en vigueur, le client dispose d'un délai de 14 jours à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motif. Les produits doivent être retournés dans leur état d'origine, non portés, non lavés et avec toutes les étiquettes attachées. Les frais de retour sont à la charge du client. Le remboursement sera effectué dans un délai de 14 jours suivant la réception du retour. Les produits personnalisés ou en solde ne sont pas éligibles au retour.`
  },
  {
    icon: <AlertTriangle size={20} />,
    title: 'Article 6 — Garantie et Conformité',
    content: `Tous les produits vendus sur atlas-kicks.com bénéficient de la garantie légale de conformité. En cas de produit défectueux ou non conforme à la description, le client peut demander l'échange ou le remboursement du produit dans un délai de 30 jours après réception. Le client doit contacter le service client en fournissant une description du défaut ainsi que des photographies.`
  },
  {
    icon: <Shield size={20} />,
    title: 'Article 7 — Protection des Données',
    content: `Les données personnelles collectées sont traitées conformément à notre Politique de Confidentialité. Elles sont utilisées uniquement pour le traitement des commandes, la gestion de la relation client et, avec le consentement du client, l'envoi d'offres promotionnelles. Le client dispose d'un droit d'accès, de rectification et de suppression de ses données en contactant soufianeaqli20@gmail.com.`
  },
  {
    icon: <FileText size={20} />,
    title: 'Article 8 — Responsabilité',
    content: `Atlas Kicks s'engage à fournir un service de qualité. Cependant, notre responsabilité ne saurait être engagée en cas de mauvaise utilisation des produits par le client ou de force majeure. Le site est fourni "en l'état" et nous nous réservons le droit de le modifier ou de l'interrompre à tout moment sans préavis.`
  },
  {
    icon: <Shield size={20} />,
    title: 'Article 9 — Litiges',
    content: `Les présentes CGV sont soumises au droit marocain. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, les tribunaux compétents de Meknès seront seuls compétents.`
  },
  {
    icon: <FileText size={20} />,
    title: 'Article 10 — Contact',
    content: `Pour toute question relative aux présentes conditions générales, vous pouvez nous contacter :\n\nEmail : soufianeaqli20@gmail.com\nTéléphone : 0679224411\nAdresse : IMM A8 APPT 4 EL MANAR 1, MEKNES, Maroc\n\nDernière mise à jour : Juillet 2026`
  },
];

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen">
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-black to-green-600/10 opacity-50"></div>
        <div className="container mx-auto relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-500 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <span className="text-gold-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Mentions Légales</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter mb-4">
            Conditions Générales
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Dernière mise à jour : Juillet 2026 — Veuillez lire attentivement les présentes conditions avant tout achat.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 md:p-8 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gold-500/10 text-gold-500">
                  {section.icon}
                </div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">{section.title}</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-xs">
            © 2026 Atlas Kicks — Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
