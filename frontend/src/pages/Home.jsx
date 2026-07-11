import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="w-full bg-transparent text-white pt-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518605368461-1e185c7be625?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            alt="Football Stadium" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white tracking-tighter mb-4"
          >
            Wear The <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">Pride</span> <br />
            Of A <span className="text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">Nation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Exclusivement marocain. Maillots officiels, tenues de match et collections lifestyle premium. Soutenez vos couleurs.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/national-team" className="bg-gold-500 text-white px-10 py-4 rounded-sm text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              Équipe Nationale
            </Link>
            <Link to="/botola" className="border-2 border-green-500 text-green-500 px-10 py-4 rounded-sm text-lg font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              Botola Pro
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
