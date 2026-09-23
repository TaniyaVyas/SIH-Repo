import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSelector } from '../../components/common/LanguageSelector';

export const VerifyAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();

  // Read possible state passed from ForgotPasswordPage
  const stateIdentifier = (location.state as any)?.identifier || 'doctor@retinafusion.ai';
  const expectedOtp = (location.state as any)?.generatedOtp || '482910';

  // Step state: 'otp' | 'new_password' | 'done'
  const [step, setStep] = useState<'otp' | 'new_password' | 'done'>('otp');

  // OTP inputs
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) return;
    setOtpError(null);
    const nextOtp = [...otp];
    nextOtp[index] = val;
    setOtp(nextOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    setOtp(expectedOtp.split(''));
    setOtpError(null);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of the code.');
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setStep('new_password');
    }, 600);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (!newPassword) {
      setPassError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await resetPassword(stateIdentifier, newPassword);
      setIsSavingPassword(false);
      setStep('done');

      // Auto-redirect to login with credentials and friendly notification after 2 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            identifier: stateIdentifier,
            message: 'Password reset successfully! Please sign in with your new password.',
          },
          replace: true,
        });
      }, 1800);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password. Please try again.');
      setIsSavingPassword(false);
    }
  };

  const goToLoginWithSuccess = () => {
    navigate('/login', {
      state: {
        identifier: stateIdentifier,
        message: 'Password reset successfully! Please sign in with your new password.',
      },
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F6EF] text-[#17221C] flex flex-col justify-between selection:bg-[#1F7A5A] selection:text-white">
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
              Two-Factor Identity & Password Reset
            </span>
          </div>
        </Link>
        <LanguageSelector variant="compact" />
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-[#DDE5DC] p-8 shadow-xl text-center">
          <AnimatePresence mode="wait">
            {/* ─── STEP 1: VERIFY OTP ─── */}
            {step === 'otp' && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1F7A5A]/10 text-[#1F7A5A] flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-black text-[#17221C] tracking-tight">
                  Enter 6-Digit Code
                </h2>
                <p className="text-xs text-[#65736B] mt-1.5 leading-relaxed">
                  Verifying account for <strong className="text-[#124B3A]">{stateIdentifier}</strong>.
                </p>

                {/* Demo Quick Fill Chip */}
                <button
                  type="button"
                  onClick={handleQuickFillOtp}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9A23B]/15 text-[#8A5612] text-[11px] font-bold hover:bg-[#E9A23B]/25 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use Demo Code: {expectedOtp}</span>
                </button>

                <form onSubmit={handleVerifyOtp} className="mt-6">
                  <div className="flex justify-center gap-2 mb-4">
                    {otp.map((digit, idx) => (
                      <motion.input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        whileFocus={{ scale: 1.05 }}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        className={`w-11 h-12 text-center text-lg font-bold bg-[#F8F6EF] border rounded-xl text-[#17221C] focus:outline-none focus:ring-2 focus:ring-[#1F7A5A] transition-all ${
                          digit ? 'border-[#1F7A5A] bg-[#1F7A5A]/5' : 'border-[#DDE5DC]'
                        }`}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-xs text-[#E76F51] mb-4 font-semibold">{otpError}</p>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isVerifyingOtp || otp.some((d) => !d)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 px-6 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Validating OTP Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Code & Continue</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 2: SET NEW PASSWORD ─── */}
            {step === 'new_password' && (
              <motion.div
                key="step-new-pass"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-left"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1F7A5A]/10 text-[#1F7A5A] flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-black text-[#17221C] text-center tracking-tight">
                  Set New Password
                </h2>
                <p className="text-xs text-[#65736B] text-center mt-1.5 leading-relaxed">
                  Choose a new secure password for <strong className="text-[#124B3A]">{stateIdentifier}</strong>.
                </p>

                {passError && (
                  <div className="mt-4 p-3 rounded-xl bg-[#E76F51]/10 border border-[#E76F51]/30 text-xs text-[#E76F51] font-semibold">
                    {passError}
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF] text-sm focus:border-[#1F7A5A] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#17221C] mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DDE5DC] bg-[#F8F6EF] text-sm focus:border-[#1F7A5A] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#65736B] hover:text-[#124B3A]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSavingPassword || !newPassword || !confirmPassword}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 px-6 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isSavingPassword ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password & Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ─── STEP 3: SUCCESS CONFIRMATION ─── */}
            {step === 'done' && (
              <motion.div
                key="step-done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1F7A5A]/15 text-[#1F7A5A] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#17221C]">Password Updated!</h3>
                <p className="text-xs text-[#65736B] mt-2 leading-relaxed">
                  Your credentials for <strong className="text-[#17221C]">{stateIdentifier}</strong> have been securely updated. You can now sign in to your workspace.
                </p>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={goToLoginWithSuccess}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#124B3A] text-white text-xs font-bold hover:bg-[#1F7A5A] transition-all shadow-md shadow-[#124B3A]/20"
                  >
                    <span>Proceed to Sign In Now</span>
                    <ArrowRight className="w-4 h-4" />
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
              <span>Back to Sign In</span>
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
