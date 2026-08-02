import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainWebsiteLogo } from '../common/MainWebsiteLogo';
import {
  ShieldCheck,
  Lock,
  Globe2,
  Mail,
  Phone,
  Heart,
  X,
  CheckCircle2,
} from 'lucide-react';

interface LandingFooterProps {
  onNavigateSection: (sectionId: string) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  onNavigateSection,
  onOpenLogin,
  onOpenSignup,
}) => {
  const { settings, language } = useApp();
  const isBn = language === 'bn';

  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <footer className="bg-slate-900 dark:bg-[#060608] border-t border-slate-800 text-slate-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Top Footer 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Logo Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <MainWebsiteLogo
                size={32}
                customUrl={settings.siteLogoUrl}
                siteName={settings.siteBrandName || 'YearInvo'}
                subName={settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}
              />
              <span className="font-black text-lg text-white tracking-tight">
                {settings.siteBrandName || 'YearInvo'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? 'স্মার্ট খুচরা POS ও ইনভেন্টরি সফটওয়্যার। সহজ কেনাবেচা, অটো স্টক হিসাব ও থার্মাল বারকোড প্রিন্ট।'
                : 'Empowering local SME merchants with cloud-native POS terminal, barcode printing, and profit management.'}
            </p>

            <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Firebase Cloud Encrypted</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isBn ? 'নেভিগেশন' : 'Navigation'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigateSection('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'হোম পেজ' : 'Home'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'ফিচার সমূহ' : 'Features'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('pricing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'প্রাইসিং ও প্ল্যান' : 'Pricing Plans'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'আমাদের কথা' : 'About Us'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('support')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'হেল্প সেন্টারে যোগাযোগ' : 'Support & Help Center'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Account Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isBn ? 'শর্তাবলী ও অ্যাকাউন্ট' : 'Legal & Account'}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setLegalModal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'প্রাইভেসী পলিসি (Privacy Policy)' : 'Privacy Policy'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setLegalModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'ব্যবহারের শর্তাবলী (Terms & Conditions)' : 'Terms & Conditions'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenLogin}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {isBn ? 'দোকানে লগইন করুন' : 'Sign In to Store'}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSignup}
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                >
                  {isBn ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন' : 'Create Free Store'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              {isBn ? 'যোগাযোগ ও সোশ্যাল' : 'Contact Us'}
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>teamstock07@gmail.com</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>+880 1700-000000</span>
              </p>
              <p className="text-slate-500 pt-1">
                Dhaka, Bangladesh • Global Cloud Service
              </p>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              {['Facebook', 'LinkedIn', 'YouTube', 'WhatsApp'].map((s, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Copyright Notice */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            © {new Date().getFullYear()} {settings.siteBrandName || 'YearInvo'} {settings.siteSubBrandName !== undefined ? settings.siteSubBrandName : 'by Year Media'}. All rights reserved.
          </p>

          <p className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Retail Businesses</span>
          </p>
        </div>

      </div>

      {/* Legal Modal Overlay (Privacy / Terms) */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto relative space-y-4 text-slate-300">
            <button
              onClick={() => setLegalModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-black text-white">
              {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>

            {legalModal === 'privacy' ? (
              <div className="space-y-3 text-xs leading-relaxed font-normal">
                <p>
                  At YearInvo by Year Media, we respect your privacy and are committed to protecting your business data, product inventories, and sales ledger.
                </p>
                <p>
                  <strong>1. Data Collection:</strong> We collect business profile information, user account credentials, product listings, and sales transaction logs solely to provide software functionality.
                </p>
                <p>
                  <strong>2. Security:</strong> Your data is stored securely using Google Firebase Cloud database rules and encrypted connections.
                </p>
                <p>
                  <strong>3. Data Ownership:</strong> You retain complete ownership of all customer data, inventory listings, and sales records entered into YearInvo.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed font-normal">
                <p>
                  Welcome to YearInvo by Year Media. By using our SaaS POS &amp; Inventory platform, you agree to these terms:
                </p>
                <p>
                  <strong>1. Fair Usage:</strong> Free starter accounts are limited to single store usage. Pro and Premium subscriptions grant extended catalog limits and priority support.
                </p>
                <p>
                  <strong>2. Service Availability:</strong> While we aim for 99.9% uptime, software updates and cloud maintenance may occur periodically.
                </p>
                <p>
                  <strong>3. Compliance:</strong> Merchants are responsible for ensuring invoice compliance and accurate product pricing.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
