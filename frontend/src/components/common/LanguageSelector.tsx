import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageCode } from '../../types/auth';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  displayCode: string; // e.g. "GB EN", "IN ગુજ", "IN હિં"
  flagCode: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', displayCode: 'GB EN', flagCode: 'GB', nativeLabel: 'EN' },
  { code: 'gu', label: 'Gujarati', displayCode: 'IN ગુજ', flagCode: 'IN', nativeLabel: 'ગુજ' },
  { code: 'hi', label: 'Hindi', displayCode: 'IN હિં', flagCode: 'IN', nativeLabel: 'હિં' },
];

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'pill' | 'compact';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Optional pill variant (for backward compatibility)
  if (variant === 'pill') {
    return (
      <div
        className={`relative inline-block text-left select-none ${className}`}
        ref={dropdownRef}
      >
        {/* Exact header dropdown button matching user photo */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E7ECE7] hover:bg-[#DDE5DC] border border-[#CCD8CC] text-[#17221C] text-xs font-black tracking-tight shadow-2xs transition-all cursor-pointer"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span>{currentLang.displayCode}</span>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={`text-[#17221C] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu matching media_1789918339023.png */}
        {isOpen && (
          <div className="absolute right-0 mt-1 w-28 bg-white border border-[#CCD8CC] rounded-md shadow-lg py-0.5 z-50 overflow-hidden font-sans">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors block cursor-pointer ${
                    isActive
                      ? 'bg-[#1976D2] text-white'
                      : 'text-[#17221C] hover:bg-[#EBF3FF] hover:text-[#1976D2]'
                  }`}
                >
                  {lang.displayCode}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default & Dropdown variant (Exact style from user reference image)
  return (
    <div
      className={`relative inline-block text-left select-none ${className}`}
      ref={dropdownRef}
    >
      {/* Header Button matching media_1789918339023.png */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E7ECE7] hover:bg-[#DDE5DC] border border-[#CCD8CC] text-[#17221C] text-xs font-black tracking-tight shadow-2xs transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentLang.displayCode}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`text-[#17221C] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu matching user reference image */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-28 bg-white border border-[#CCD8CC] rounded-md shadow-lg py-0.5 z-50 overflow-hidden font-sans">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors block cursor-pointer ${
                  isActive
                    ? 'bg-[#1976D2] text-white'
                    : 'text-[#17221C] hover:bg-[#EBF3FF] hover:text-[#1976D2]'
                }`}
              >
                {lang.displayCode}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
