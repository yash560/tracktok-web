'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Phone, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { parsePhoneInput } from '@/lib/phone';
import axios from 'axios';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

type Step = 'identifier' | 'login' | 'register' | 'forgot' | 'otp' | 'reset-password';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, googleLogin, linkGoogleAccount, user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('identifier');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [gsiReady, setGsiReady] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);
  const [phoneAccountFound, setPhoneAccountFound] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const phoneCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [resetEmail, setResetEmail] = useState('');
  const [maskedResetEmail, setMaskedResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user && !authLoading) {
      const redirectUrl = localStorage.getItem('redirect_after_auth') || '/dashboard';
      localStorage.removeItem('redirect_after_auth');
      router.push(redirectUrl);
    }
  }, [user, authLoading, router]);

  const handleGoogleResponse = useCallback(async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const result = await googleLogin(response.credential);
      if (!result.exists && result.googleProfile) {
        setGoogleCredential(response.credential);
        setIdentifier(result.googleProfile.email);
        setIdentifierType('email');
        setFormData((prev) => ({
          ...prev,
          name: result.googleProfile!.name || '',
          email: result.googleProfile!.email,
        }));
        setStep('register');
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  }, [googleLogin]);

  const initializeGoogle = useCallback(() => {
    if (!window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: googleBtnRef.current.offsetWidth,
      text: 'continue_with',
    });
    setGsiReady(true);
  }, [handleGoogleResponse]);

  useEffect(() => {
    if (gsiReady || step !== 'identifier') return;
    if (window.google) {
      initializeGoogle();
    }
  }, [gsiReady, step, initializeGoogle]);

  const isEmail = (value: string) => value.includes('@');

  const checkPhoneExists = useCallback((phone: string) => {
    if (phoneCheckTimer.current) clearTimeout(phoneCheckTimer.current);
    setPhoneAccountFound(false);

    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return;

    setCheckingPhone(true);
    phoneCheckTimer.current = setTimeout(async () => {
      try {
        const res = await axios.post('/api/auth/check-account', { identifier: digits });
        setPhoneAccountFound(res.data.exists);
      } catch {
        setPhoneAccountFound(false);
      } finally {
        setCheckingPhone(false);
      }
    }, 500);
  }, []);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleCredential) return;
    setLoading(true);
    setError('');
    try {
      await linkGoogleAccount(googleCredential, formData.phone);
    } catch (err: any) {
      setError(err.message || 'Failed to link account');
      setLoading(false);
    }
  };

  const handleCheckAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/check-account', { identifier: identifier.trim() });
      const { exists, type } = res.data;
      setIdentifierType(type);

      if (type === 'email') {
        setFormData((prev) => ({ ...prev, email: identifier.trim() }));
      } else {
        const { countryCode, localNumber } = parsePhoneInput(identifier.trim());
        setFormData((prev) => ({ ...prev, phone: localNumber, countryCode }));
      }

      setStep(exists ? 'login' : 'register');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginIdentifier = identifierType === 'phone' ? formData.phone : identifier.trim();
      await login(loginIdentifier, formData.password, identifierType);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    const email = identifierType === 'email' ? identifier.trim() : formData.email;
    const phone = identifierType === 'phone' ? identifier.trim() : formData.phone;

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Valid phone number is required (10 digits)');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, email, formData.password, formData.countryCode, phone);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/forgot-password', { identifier: identifier.trim() });
      setResetEmail(res.data.email);
      setMaskedResetEmail(res.data.maskedEmail);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Enter 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/verify-otp', { email: resetEmail, otp });
      setStep('reset-password');
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      setShowPassword(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/reset-password', {
        email: resetEmail,
        otp,
        password: formData.password,
      });
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        setOtp('');
        setResetEmail('');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setStep('login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('identifier');
    setError('');
    setFormData({ name: '', email: '', countryCode: '+91', phone: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setGoogleCredential(null);
    setPhoneAccountFound(false);
  };

  const slideVariants = {
    enter: { opacity: 0, y: 16, filter: 'blur(4px)' },
    center: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
  };

  const stepTitle: Record<string, string> = {
    identifier: 'Welcome',
    login: 'Welcome back',
    register: phoneAccountFound && googleCredential ? 'Link account' : 'Create account',
    otp: 'Check your email',
    'reset-password': resetSuccess ? 'All done' : 'New password',
  };

  const stepSubtitle: Record<string, string> = {
    identifier: 'Enter your phone or email to get started',
    login: 'Enter your password to continue',
    register: phoneAccountFound && googleCredential ? 'Link your Google email to your existing account' : 'A few details and you\'re in',
    otp: `We sent a 6-digit code to ${maskedResetEmail}`,
    'reset-password': resetSuccess ? 'Your password has been updated' : 'Choose a strong password',
  };

  const errorBlock = error && (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3">
      <p className="text-sm text-danger font-medium">{error}</p>
    </motion.div>
  );

  const identifierChip = (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/60 dark:bg-white/5 border border-gray-200/60 dark:border-white/10">
      {identifierType === 'email' ? <Mail className="w-4 h-4 text-primary/70 flex-shrink-0" /> : <Phone className="w-4 h-4 text-primary/70 flex-shrink-0" />}
      <span className="text-sm font-medium truncate">{identifier}</span>
      <button type="button" onClick={goBack} className="ml-auto text-xs font-semibold text-primary hover:text-primary-light transition-colors flex-shrink-0">Change</button>
    </div>
  );

  const inputClass = "w-full px-4 py-3.5 bg-white/60 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 text-sm backdrop-blur-sm";

  const primaryBtn = (text: string, loadingText: string, disabled?: boolean) => (
    <button type="submit" disabled={loading || disabled} className="group relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-light to-primary bg-[length:200%_100%] group-hover:bg-right transition-[background-position] duration-500" />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? loadingText : text}
        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
      </span>
    </button>
  );

  const backBtn = (onClick: () => void) => (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
      <ArrowLeft className="w-3.5 h-3.5" /> Back
    </button>
  );

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />

      <div className="min-h-screen flex">
        {/* Left brand panel — hidden on mobile */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-primary">
          <div className="absolute inset-0">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-light/30 blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-3xl animate-pulse [animation-delay:2s]" />
            <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-accent/15 blur-3xl animate-pulse [animation-delay:4s]" />
          </div>

          <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                <Image src="/logo.png" alt="TrackTok" width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold font-display text-white/90">TrackTok</span>
            </Link>

            <div className="space-y-8">
              <h2 className="text-4xl xl:text-5xl font-display font-extrabold text-white leading-tight">
                Your finances,<br />
                <span className="text-white/60">beautifully tracked.</span>
              </h2>
              <div className="space-y-4">
                {['AI-powered insights', 'Auto-detect transactions', 'Smart split expenses'].map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-white/70 text-sm font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-white/30 text-xs">
              &copy; {new Date().getFullYear()} TrackTok AI
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 relative overflow-hidden bg-gray-50/80 dark:bg-dark-bg">
          <div className="absolute top-[-30%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-20%] left-[-15%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

          <div className="w-full max-w-[420px] relative z-10">
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <Image src="/logo.png" alt="TrackTok" width={36} height={36} className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold font-display text-primary">TrackTok</span>
            </Link>

            {/* Step header */}
            <motion.div key={step + '-header'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
              <h1 className="text-2xl sm:text-[28px] font-display font-bold tracking-tight mb-2">{stepTitle[step]}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{stepSubtitle[step]}</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {/* Identifier */}
              {step === 'identifier' && (
                <motion.form key="identifier" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} onSubmit={handleCheckAccount} className="space-y-5">
                  {errorBlock}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone or Email</label>
                    <div className="relative">
                      {isEmail(identifier)
                        ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                        : <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />}
                      <input id="identifier" type="text" placeholder="you@example.com or 9876543210" value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }} required autoFocus autoComplete="username" className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                  {primaryBtn('Continue', 'Checking...', !identifier.trim())}
                  <div className="relative py-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200/60 dark:border-white/10" /></div><div className="relative flex justify-center"><span className="px-4 text-xs text-gray-400 bg-gray-50/80 dark:bg-dark-bg">or</span></div></div>
                  <div ref={googleBtnRef} className="w-full flex justify-center [&>div]:!w-full" />
                </motion.form>
              )}

              {/* Login */}
              {step === 'login' && (
                <motion.form key="login" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} onSubmit={handleLogin} className="space-y-5">
                  {errorBlock}
                  {identifierChip}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                      <input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }} required autoFocus className={`${inputClass} pl-11 pr-11`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {backBtn(goBack)}
                    <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">{loading ? 'Sending...' : 'Forgot password?'}</button>
                  </div>
                  {primaryBtn('Sign in', 'Signing in...')}
                </motion.form>
              )}

              {/* Register */}
              {step === 'register' && (
                <motion.form key="register" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} onSubmit={handleRegister} className="space-y-4">
                  {errorBlock}
                  {identifierChip}
                  {!(phoneAccountFound && googleCredential) && (
                    <div className="rounded-xl bg-primary/5 border border-primary/15 px-4 py-2.5">
                      <p className="text-xs text-primary font-medium">No account found — create one below</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                      <input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(''); }} required autoFocus autoComplete="name" className={`${inputClass} pl-11`} />
                    </div>
                  </div>
                  {identifierType === 'phone' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                        <input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }} required autoComplete="email" className={`${inputClass} pl-11`} />
                      </div>
                    </div>
                  )}
                  {identifierType === 'email' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="flex gap-2">
                        <select value={formData.countryCode} onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })} className={`${inputClass} !w-24 flex-shrink-0 text-xs`}>
                          <option value="+1">+1</option><option value="+44">+44</option><option value="+91">+91</option><option value="+61">+61</option><option value="+64">+64</option><option value="+27">+27</option><option value="+86">+86</option><option value="+81">+81</option><option value="+33">+33</option><option value="+49">+49</option><option value="+39">+39</option><option value="+34">+34</option>
                        </select>
                        <div className="flex-1 relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input type="tel" name="phone_number_field" placeholder="10 digit number" value={formData.phone} onChange={(e) => { if (/[a-zA-Z@]/.test(e.target.value)) return; const val = e.target.value.replace(/[^0-9]/g, ''); setFormData({ ...formData, phone: val }); setError(''); if (googleCredential) checkPhoneExists(val); }} required autoComplete="off" data-form-type="other" className={`${inputClass} pl-11`} />
                        </div>
                      </div>
                    </div>
                  )}
                  {phoneAccountFound && googleCredential ? (
                    <>
                      <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/40 px-4 py-3">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Account found with this phone. Your email <strong>{identifier}</strong> will be linked.</p>
                      </div>
                      {backBtn(goBack)}
                      <button type="button" onClick={handleLinkAccount} disabled={loading} className="group relative w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-500" />
                        <span className="relative flex items-center justify-center gap-2">{loading ? 'Linking...' : 'Link & Sign In'}{!loading && <ArrowRight className="w-4 h-4" />}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }} required className={`${inputClass} pl-11 pr-11`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"><EyeOff className="w-[18px] h-[18px]" /></button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(''); }} required className={`${inputClass} pl-11`} />
                        </div>
                      </div>
                      {backBtn(goBack)}
                      {primaryBtn('Create account', 'Creating...')}
                    </>
                  )}
                </motion.form>
              )}

              {/* OTP */}
              {step === 'otp' && (
                <motion.form key="otp" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} onSubmit={handleVerifyOtp} className="space-y-5">
                  {errorBlock}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Verification Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                      <input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} required autoFocus autoComplete="one-time-code" className={`${inputClass} pl-11 tracking-[0.4em] font-mono text-center text-lg`} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {backBtn(() => { setStep('login'); setOtp(''); setError(''); })}
                    <button type="button" onClick={handleForgotPassword} disabled={loading} className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">Resend code</button>
                  </div>
                  {primaryBtn('Verify', 'Verifying...', otp.length !== 6)}
                </motion.form>
              )}

              {/* Reset Password */}
              {step === 'reset-password' && (
                <motion.div key="reset-password" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }}>
                  {resetSuccess ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-5 py-10">
                      <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-400">Redirecting to login...</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                      {errorBlock}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }} required autoFocus className={`${inputClass} pl-11 pr-11`} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">{showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                          <input id="confirm-new-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(''); }} required className={`${inputClass} pl-11`} />
                        </div>
                      </div>
                      {primaryBtn('Reset password', 'Resetting...')}
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
