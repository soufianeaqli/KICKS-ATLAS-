import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import zelijPatternUrl from '../assets/moroccan_flag_zelij.png';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, confirmText, cancelText, danger, success }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${zelijPatternUrl})`,
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
            backdropFilter: 'blur(4px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
            className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
          >
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${success ? 'bg-green-500/20' : danger ? 'bg-red-500/20' : 'bg-gold-500/20'}`}>
                  {success
                    ? <CheckCircle size={20} className="text-green-400" />
                    : <AlertTriangle size={20} className={danger ? 'text-red-500' : 'text-gold-500'} />
                  }
                </div>
                <h3 className="text-lg font-black uppercase tracking-wider text-white">{title || 'Confirmation'}</h3>
              </div>
              {onCancel && (
                <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="p-5">
              <p className="text-gray-300 leading-relaxed">{message || 'Êtes-vous sûr ?'}</p>
            </div>
            <div className="flex justify-end gap-3 p-5 pt-0">
              {onCancel && (
                <button onClick={onCancel}
                  className="px-5 py-2.5 border border-white/10 text-gray-300 rounded-lg font-bold uppercase text-xs tracking-wider hover:bg-white/10 hover:text-white transition-all">
                  {cancelText || 'Annuler'}
                </button>
              )}
              <button onClick={onConfirm}
                className={`px-5 py-2.5 rounded-lg font-bold uppercase text-xs tracking-wider text-white transition-all ${
                  success ? 'bg-green-600 hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : danger ? 'bg-red-600 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-gold-500 text-black hover:bg-white hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                }`}>
                {confirmText || 'Confirmer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
