import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './store/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import NationalTeam from './pages/NationalTeam';
import Botola from './pages/Botola';
import TeamStore from './pages/TeamStore';
import Contact from './pages/Contact';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Challenges from './pages/Challenges';
import Help from './pages/Help';
import Faq from './pages/Faq';
import DeliveryReturns from './pages/DeliveryReturns';
import OrderTracking from './pages/OrderTracking';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AddToCartAnimation from './components/AddToCartAnimation';

import zelijPatternUrl from './assets/moroccan_flag_zelij.png';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const pageTransition = {
  duration: 0.2,
  ease: 'easeOut',
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

const getBackgroundStyle = () => {
  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${zelijPatternUrl})`,
    backgroundSize: '300px',
    backgroundRepeat: 'repeat',
    backgroundAttachment: 'fixed',
  };
};

function AppContent() {
  const bgStyle = getBackgroundStyle();
  const location = useLocation();
  const hideNavFooter = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen" style={bgStyle}>
      {!hideNavFooter && <Navbar />}
      <AddToCartAnimation />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/national-team" element={<AnimatedPage><NationalTeam /></AnimatedPage>} />
            <Route path="/botola" element={<AnimatedPage><Botola /></AnimatedPage>} />
            <Route path="/team/:teamId" element={<AnimatedPage><TeamStore /></AnimatedPage>} />
            <Route path="/product/:id" element={<AnimatedPage><ProductDetails /></AnimatedPage>} />
            <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
            <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><AdminDashboard /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/contact" element={<AnimatedPage><Contact /></AnimatedPage>} />
            <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
            <Route path="/myorders" element={<AnimatedPage><MyOrders /></AnimatedPage>} />
            <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="/challenges" element={<AnimatedPage><Challenges /></AnimatedPage>} />
            <Route path="/help" element={<AnimatedPage><Help /></AnimatedPage>} />
            <Route path="/faq" element={<AnimatedPage><Faq /></AnimatedPage>} />
            <Route path="/delivery-returns" element={<AnimatedPage><DeliveryReturns /></AnimatedPage>} />
            <Route path="/order-tracking" element={<AnimatedPage><OrderTracking /></AnimatedPage>} />
            <Route path="/terms" element={<AnimatedPage><TermsAndConditions /></AnimatedPage>} />
            <Route path="/privacy" element={<AnimatedPage><PrivacyPolicy /></AnimatedPage>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!hideNavFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
