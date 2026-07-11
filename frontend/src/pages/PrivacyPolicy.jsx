import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Eye, Database, Lock, UserCheck, Mail, Trash2, FileText, Globe } from 'lucide-react';

const sections = [
  {
    icon: <Eye size={20} />,
    title: '1. Responsable du Traitement',
    content: `Le responsable du traitement des données personnelles est :\n\nAtlas Kicks — Soufiane Aqli\nIMM A8 APPT 4 EL MANAR 1, MEKNES, Maroc\nEmail : soufianeaqli20@gmail.com\n\nNous nous engageons à protéger la vie privée de nos utilisateurs conformément à la législation marocaine en vigueur (Loi n°09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel).`
  },
  {
    icon: <Database size={20} />,
    title: '2. Données Collectées',
    content: `Nous collectons les données suivantes dans le cadre de l'utilisation de notre site :\n\n• Données d'identification : nom, prénom, adresse email\n• Données de livraison : adresse, ville, code postal, pays\n• Données de commande : historique d'achats, montant, produits\n• Données de connexion : adresse IP, navigateur, système d'exploitation\n• Données de navigation : pages visitées, durée de session, actions effectuées\n\nCes données sont collectées lors de la création de compte, de la passation de commande, du formulaire de contact ou automatiquement lors de la navigation.`
  },
  {
    icon: <Lock size={20} />,
    title: '3. Finalités du Traitement',
    content: `Vos données personnelles sont traitées pour les finalités suivantes :\n\n• Traitement et suivi de vos commandes\n• Gestion de votre compte client\n• Livraison de vos achats\n• Service client et gestion des réclamations\n• Envoi de newsletters et offres promotionnelles (avec votre consentement)\n• Amélioration de nos services et de l'expérience utilisateur\n• Prévention de la fraude et sécurité du site\n• Respect de nos obligations légales et réglementaires`
  },
  {
    icon: <UserCheck size={20} />,
    title: '4. Base Légale du Traitement',
    content: `Le traitement de vos données repose sur :\n\n• L'exécution du contrat de vente (traitement de commande, livraison)\n• Votre consentement (newsletter, cookies non essentiels)\n• Notre intérêt légitime (amélioration du service, prévention de la fraude)\n• Nos obligations légales (conservation des factures, comptabilité)`
  },
  {
    icon: <Globe size={20} />,
    title: '5. Partage des Données',
    content: `Vos données personnelles peuvent être partagées avec les partenaires suivants uniquement dans le cadre des finalités décrites :\n\n• Prestataires de paiement (Stripe) — pour le traitement sécurisé des transactions\n• Sociétés de livraison — pour l'acheminement de vos commandes\n• Hébergeur du site — pour le stockage sécurisé des données\n• Service d'analyse — pour améliorer nos services (données anonymisées)\n\nNous ne vendons jamais vos données personnelles à des tiers.`
  },
  {
    icon: <Lock size={20} />,
    title: '6. Sécurité des Données',
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :\n\n• Chiffrement SSL/TLS pour toutes les communications\n• Mots de passe hashés en base de données\n• Accès restreint aux données personnelles\n• Surveillance régulière de la sécurité du système\n• Mises à jour de sécurité régulières\n\nEn cas de violation de données susceptible d'engendrer un risque pour vos droits, nous vous en informerons dans les meilleurs délais.`
  },
  {
    icon: <FileText size={20} />,
    title: '7. Conservation des Données',
    content: `Vos données sont conservées pour les durées suivantes :\n\n• Données de compte : pendant toute la durée de votre inscription, puis 3 ans après la dernière connexion\n• Données de commande : 5 ans (obligation comptable)\n• Données de contact : 3 ans après le dernier échange\n• Cookies : 13 mois maximum\n\nÀ l'expiration de ces délais, vos données sont supprimées ou anonymisées.`
  },
  {
    icon: <Trash2 size={20} />,
    title: '8. Vos Droits',
    content: `Conformément à la législation applicable, vous disposez des droits suivants :\n\n• Droit d'accès : obtenir une copie de vos données personnelles\n• Droit de rectification : corriger les données inexactes\n• Droit à l'effacement : demander la suppression de vos données\n• Droit d'opposition : vous opposer au traitement de vos données\n• Droit à la portabilité : recevoir vos données dans un format structuré\n• Droit de retrait du consentement à tout moment\n\nPour exercer vos droits, contactez-nous à : soufianeaqli20@gmail.com\nNous répondons à votre demande dans un délai de 30 jours.`
  },
  {
    icon: <Mail size={20} />,
    title: '9. Cookies',
    content: `Notre site utilise des cookies pour améliorer votre expérience :\n\n• Cookies essentiels : nécessaires au fonctionnement du site (panier, session)\n• Cookies analytiques : pour comprendre comment vous utilisez le site (anonymisés)\n• Cookies de préférences : pour mémoriser vos choix (langue, affichage)\n\nVous pouvez gérer vos préférences de cookies à tout moment via les paramètres de votre navigateur. Le refus de certains cookies peut affecter le fonctionnement du site.`
  },
  {
    icon: <Shield size={20} />,
    title: '10. Contact',
    content: `Pour toute question relative à la protection de vos données personnelles ou pour exercer vos droits, contactez-nous :\n\nEmail : soufianeaqli20@gmail.com\nTéléphone : 0679224411\nAdresse : IMM A8 APPT 4 EL MANAR 1, MEKNES, Maroc\n\nSi vous estimez que le traitement de vos données n'est pas conforme à la réglementation, vous avez le droit d'introduire une réclamation auprès de l'autorité compétente.\n\nDernière mise à jour : Juillet 2026`
  },
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-black to-purple-600/10 opacity-50"></div>
        <div className="container mx-auto relative z-10 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gold-500 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
          <span className="text-gold-500 font-bold tracking-[0.3em] uppercase text-sm mb-4 block">Protection des Données</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase text-white tracking-tighter mb-4">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Dernière mise à jour : Juillet 2026 — Vos données sont protégées et sécurisées.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 max-w-4xl">
        <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-6 mb-10">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-green-400 font-bold text-sm uppercase tracking-wider mb-1">Engagement Atlas Kicks</p>
              <p className="text-gray-400 text-sm">Nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique de manière transparente quelles données nous collectons, pourquoi, et comment vous pouvez exercer vos droits.</p>
            </div>
          </div>
        </div>

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
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
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

export default PrivacyPolicy;
