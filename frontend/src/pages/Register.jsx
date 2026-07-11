import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../config';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLocal, setErrorLocal] = useState('');
  const navigate = useNavigate();

  const { userInfo, setUserInfo } = useAuthStore();

  useEffect(() => {
    if (userInfo) navigate('/');
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorLocal('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      setUserInfo(data);
    } catch (error) {
      setErrorLocal(error.response && error.response.data.message ? error.response.data.message : error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row"
      >
        {/* Left: Zellige Artwork */}
        <div className="relative lg:w-1/2 min-h-[250px] lg:min-h-[650px] overflow-hidden">
          <img
            src="/login-design.jpg"
            alt="Moroccan Zellige Art"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12">
            <div>
              <span className="text-red-500 font-black text-xl tracking-widest">ATLAS</span>
              <span className="text-white font-light text-xl"> KICKS</span>
            </div>
            <div className="mb-4">
              <p className="text-white text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tight">
                Rejoignez<br />La Famille<br />Atlas
              </p>
              <div className="flex gap-2 mt-4">
                <div className="w-10 h-1 bg-red-500 rounded-full"></div>
                <div className="w-10 h-1 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Droit Image + Register Form */}
        <div className="relative lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center overflow-hidden">
          <img
            src="/droit.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f1115]/85"></div>
          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
                Créer un <span className="text-green-500">Compte</span>
              </h1>
              <p className="text-white/70 mt-2 text-sm">Rejoignez Atlas Kicks pour des drops exclusifs</p>
            </div>

            {errorLocal && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
                {errorLocal}
              </div>
            )}

            <motion.form
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              onSubmit={submitHandler}
              className="space-y-5"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Nom complet</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><User size={18} /></div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3.5 pl-12 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-gray-500 backdrop-blur-sm"
                    placeholder="Achraf Hakimi"
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Mail size={18} /></div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3.5 pl-12 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-gray-500 backdrop-blur-sm"
                    placeholder="achraf@example.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Lock size={18} /></div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3.5 pl-12 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-gray-500 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 text-center font-bold uppercase tracking-widest transition-all duration-300 rounded-lg flex items-center justify-center gap-3 bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 cursor-pointer"
              >
                Créer mon compte <ArrowRight size={18} />
              </motion.button>
            </motion.form>
            
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Déjà un compte ? <Link to="/login" className="text-green-400 hover:text-green-300 font-bold transition-colors">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
