import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CookNow from './pages/CookNow';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import MealPlan from './pages/MealPlan';
import GroceryList from './pages/GroceryList';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Premium from './pages/Premium';
import BottomNav from './components/BottomNav';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Splash />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><Signup /></PageWrapper>} />
        <Route path="/home" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/cook-now" element={<PageWrapper><CookNow /></PageWrapper>} />
        <Route path="/recipes" element={<PageWrapper><Recipes /></PageWrapper>} />
        <Route path="/recipe/:id" element={<PageWrapper><RecipeDetail /></PageWrapper>} />
        <Route path="/meal-plan" element={<PageWrapper><MealPlan /></PageWrapper>} />
        <Route path="/grocery-list" element={<PageWrapper><GroceryList /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        <Route path="/premium" element={<PageWrapper><Premium /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen pb-24"
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavPaths = ['/', '/splash', '/onboarding', '/login', '/signup', '/cook-now'];
  const shouldHideNav = hideNavPaths.includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-primary-bg overflow-x-hidden">
      <AnimatedRoutes />
      {!shouldHideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
