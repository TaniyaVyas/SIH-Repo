import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, ArrowRight, ArrowLeft, CheckCircle2, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('482910');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    // Generate simulated 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 650);
  };

  const isInputValid = identifier.trim().length >= 4;

  const handleProceedToOtp = () => {
    navigate('/verify-account', {
      state: {
        identifier: identifier.trim(),
        generatedOtp,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] flex flex-col justify-between selection:bg-[#1F7A5A] selection:text-white">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-[#DDE5DC] bg-white/85 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#124B3A] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            RF
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wider text-[#124B3A] uppercase">
              RETINAFUSION 360
            </span>
            <span className="text-[10px] text-[#65736B] tracking-tight">
              Clinical Credential Recovery
            </span>
          </div>
        </Link>
        <LanguageSelector variant="compact" />
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-8 shadow-xl">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E9A23B]/20 text-[#A6680C] flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-[#17221C] tracking-tight">
                  Reset Account Password
                </h2>
                <p className="text-xs text-[#65736B] mt-1.5 leading-relaxed">
                  Enter your registered hospital email, doctor email, or patient mobile number to receive a secure recovery OTP code.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C]">
                        Email Address or Mobile Number
                      </label>
                      {isInputValid && (
                        <span className="text-[11px] text-[#1F7A5A] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Valid
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      {identifier.includes('@') ? (
                        <Mail className="w-4 h-4 text-[#65736B] absolute left-3.5 top-3.5 pointer-events-none" />
                      ) : (
                        <Phone className="w-4 h-4 text-[#65736B] absolute left-3.5 top-3.5 pointer-events-none" />
                      )}
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="doctor@retinafusion.ai or +91 98231 45678"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F8F6EF] border border-[#DDE5DC] text-sm text-[#17221C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5A] transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick helper links for test accounts */}
                  <div className="p-2.5 rounded-xl bg-[#FAF4ED] border border-[#DDE5DC] text-[11px] text-[#65736B] flex items-center justify-between">
                    <span>Quick test demo:</span>
                    <div className="flex items-center gap-2 font-bold text-[#124B3A]">
                      <button
                        type="button"
                        onClick={() => setIdentifier('doctor@retinafusion.ai')}
                        className="hover:underline"
                      >
                        Doctor
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setIdentifier('+91 98231 45678')}
                        className="hover:underline"
                      >
                        Patient
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setIdentifier('hospital@retinafusion.ai')}
                        className="hover:underline"
                      >
                        Hospital
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || !isInputValid}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Transmitting Security Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1F7A5A]/15 text-[#1F7A5A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#17221C]">Security Code Dispatched</h3>
                <p className="text-xs text-[#65736B] mt-2 leading-relaxed">
                  We dispatched a 6-digit verification code for <strong className="text-[#17221C]">{identifier}</strong>.
                </p>

                {/* Simulated Dispatched Code Card */}
                <div className="my-5 p-4 rounded-2xl bg-[#F8F6EF] border border-[#1F7A5A]/30 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#1F7A5A] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#E9A23B]" />
                    Generated Security Code
                  </span>
                  <span className="text-2xl font-mono font-black tracking-widest text-[#124B3A]">
                    {generatedOtp}
                  </span>
                  <span className="text-[10px] text-[#65736B]">Valid for 10 minutes</span>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleProceedToOtp}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20"
                  >
                    <span>Proceed to Verify & Set Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="w-full py-2 text-xs font-semibold text-[#65736B] hover:text-[#17221C]"
                  >
                    Use a different email or phone
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-6 border-t border-[#DDE5DC] text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#65736B] hover:text-[#17221C]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-xs text-[#65736B] border-t border-[#DDE5DC] bg-white/60">
        RETINAFUSION 360 Security Gateway
      </footer>
    </div>
  );
};
