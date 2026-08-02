import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingPricing } from './LandingPricing';
import { LandingAbout } from './LandingAbout';
import { LandingSupport } from './LandingSupport';
import { LandingFooter } from './LandingFooter';
import { MobileLandingPage } from './mobile/MobileLandingPage';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onOpenSignup }) => {
  const { theme } = useApp();
  const [activeSection, setActiveSection] = useState<string>('home');

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#09090b] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} font-sans select-none relative overflow-x-hidden transition-colors`}>
      
      {/* ========================================================= */}
      {/* MOBILE LANDING PAGE (Exclusive for phones < 768px)       */}
      {/* ========================================================= */}
      <div className="block md:hidden">
        <MobileLandingPage
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
          onNavigateSection={handleNavigateSection}
        />
      </div>

      {/* ========================================================= */}
      {/* DESKTOP & TABLET LANDING PAGE (>= 768px)                 */}
      {/* ========================================================= */}
      <div className="hidden md:block">
        {/* Responsive Header */}
        <LandingHeader
          activeSection={activeSection}
          onNavigateSection={handleNavigateSection}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
        />

        {/* Hero Section */}
        <LandingHero
          onOpenSignup={onOpenSignup}
          onOpenLogin={onOpenLogin}
        />

        {/* Features Section */}
        <LandingFeatures
          onOpenSignup={onOpenSignup}
        />

        {/* Pricing / Subscription Section */}
        <LandingPricing
          onOpenSignup={onOpenSignup}
        />

        {/* About Section */}
        <LandingAbout />

        {/* Support & FAQ Section */}
        <LandingSupport />

        {/* Footer Section */}
        <LandingFooter
          onNavigateSection={handleNavigateSection}
          onOpenLogin={onOpenLogin}
          onOpenSignup={onOpenSignup}
        />
      </div>

    </div>
  );
};

