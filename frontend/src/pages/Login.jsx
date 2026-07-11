import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { User, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { login, setUserInfo, userInfo, loading, error } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      const data = {
        _id: searchParams.get('id'),
        name: searchParams.get('name'),
        email: searchParams.get('email'),
        role: searchParams.get('role'),
        token,
      };
      setUserInfo(data);
    }
  }, []);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    await login(email, password);
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
        <div className="relative lg:w-1/2 min-h-[250px] lg:min-h-[600px] overflow-hidden">
          <img
            src="/login.jpg"
            alt="Moroccan Zellige Art"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12">
            <div>
              <span className="text-red-600 font-black text-6xl tracking-widest">ATLAS</span>
              <span className="text-green-700 font-black text-6xl"> KICKS</span>
            </div>
            <div className="mb-4">
              <p className="text-white text-3xl lg:text-4xl font-black uppercase leading-tight tracking-tight">
                L'Art du<br />Football<br />Marocain
              </p>
              <div className="flex gap-2 mt-4">
                <div className="w-10 h-1 bg-red-500 rounded-full"></div>
                <div className="w-10 h-1 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Droit Image + Login Form */}
        <div className="relative lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center overflow-hidden">
          <img
            src="/login-design.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0f1115]/85"></div>
          <div className="relative z-10">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white">
                <span className="text-green-500">Bienvenue</span>
              </h1>
              <p className="text-white/70 mt-2 text-sm">Connectez-vous à votre compte Atlas Kicks</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <motion.form
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              onSubmit={submitHandler}
              className="space-y-5"
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <User size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/20 text-white rounded-lg p-3.5 pl-12 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-gray-500 backdrop-blur-sm"
                    placeholder="admin@atlaskicks.com"
                  />
                </div>
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <label className="block text-xs font-bold text-green-400 uppercase tracking-widest mb-2">Mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                    <Lock size={18} />
                  </div>
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
                disabled={loading}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                whileHover={loading ? {} : { scale: 1.02 }}
                whileTap={loading ? {} : { scale: 0.98 }}
                className={`w-full py-4 text-center font-bold uppercase tracking-widest transition-all duration-300 rounded-lg flex items-center justify-center gap-3 ${loading
                  ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/30 cursor-pointer'
                  }`}
              >
                {loading ? 'Connexion...' : (
                  <>Se Connecter <ArrowRight size={18} /></>
                )}
              </motion.button>
            </motion.form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center"><span className="bg-gray-900 px-4 text-xs text-gray-500 uppercase tracking-wider">Ou</span></div>
            </div>

            <motion.a
              href="http://localhost:5000/api/auth/google"
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 text-center font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </g>
              </svg>
              Se connecter avec Google
            </motion.a>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-green-400 hover:text-green-300 font-bold transition-colors">Créer un compte</Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
