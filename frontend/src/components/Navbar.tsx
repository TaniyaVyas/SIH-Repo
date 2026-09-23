import React, { useState, useEffect } from 'react';
import { Menu, X, Eye, Play, Sparkles } from 'lucide-react';

interface NavbarProps {
  onLaunchDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchDemo }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const navItems = [
    { label: 'Home', href: '#hero', id: 'hero' },
    { label: 'Preprocessing', href: '#module2-preprocessing', id: 'module2-preprocessing' },
    { label: 'Architecture', href: '#architecture', id: 'architecture' },
    { label: 'AI Pipeline', href: '#pipeline', id: 'pipeline' },
    { label: 'Explainability', href: '#explainability', id: 'explainability' },
    { label: 'Trust', href: '#trust', id: 'trust' },
    { label: 'Care Pathway', href: '#pathway', id: 'pathway' },
    { label: 'Impact', href: '#impact', id: 'impact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Track active section based on scroll offset
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 sm:px-6 transition-all duration-300 pointer-events-none">
      <div
        className={`w-full max-w-7xl transition-all duration-300 pointer-events-auto ${
          isScrolled ? 'pt-3' : 'pt-6'
        }`}
      >
        <nav
          className={`flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all duration-300 ${
            isScrolled
              ? 'glass-ivory shadow-warm-lg border border-[#DDE5DC]'
              : 'bg-transparent'
          }`}
        >
          {/* Logo & Brand */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-full bg-[#124B3A] flex items-center justify-center text-[#FFFDF8] shadow-warm-sm group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5 text-[#FFFDF8]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight font-display text-[#17221C]">
                RETINA-FUSION <span className="text-[#1F7A5A]">360</span>
              </span>
              <span className="hidden lg:block text-[9px] font-mono text-[#65736B] tracking-wider uppercase">
                AI with Structure & Trust
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 px-3 py-1 rounded-full bg-[#FFFDF8]/70 border border-[#DDE5DC]/60 shadow-warm-sm">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-[#124B3A]'
                      : 'text-[#65736B] hover:text-[#17221C]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-[#E8F3EE] border border-[#C8D4C7] rounded-full -z-10" />
                  )}
                  {item.label}
                </a>
              );
            })}
          </div>

          {/* Action CTA & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchDemo}
              className="relative group px-4 py-2 rounded-full text-xs font-bold font-display tracking-wide uppercase bg-[#124B3A] hover:bg-[#0E3C2E] text-[#FFFDF8] shadow-warm-md hover:shadow-emerald-glow transition-all duration-200 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#E9A23B] animate-ping" />
              <Play className="w-3 h-3 fill-[#FFFDF8]" />
              <span>Launch Screening Demo</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-[#FFFDF8] border border-[#DDE5DC] text-[#17221C] shadow-warm-sm"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-20 z-50 p-6 rounded-3xl bg-[#FFFDF8] border border-[#DDE5DC] shadow-warm-xl md:hidden pointer-events-auto">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeSection === item.id
                    ? 'bg-[#E8F3EE] text-[#124B3A] border border-[#C8D4C7]'
                    : 'text-[#65736B] hover:bg-[#F8F6EF]'
                }`}
              >
                {item.label}
              </a>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunchDemo();
              }}
              className="mt-2 w-full py-3 rounded-xl bg-[#124B3A] text-[#FFFDF8] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-warm-md"
            >
              <Play className="w-4 h-4 fill-[#FFFDF8]" />
              <span>Launch Screening Demo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
