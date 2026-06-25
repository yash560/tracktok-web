'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Phone } from 'lucide-react';
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

type Step = 'identifier' | 'login' | 'register';

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

  const goBack = () => {
    setStep('identifier');
    setError('');
    setFormData({ name: '', email: '', countryCode: '+91', phone: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setGoogleCredential(null);
    setPhoneAccountFound(false);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <>
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={initializeGoogle}
    />
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-gray-900">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 sm:mb-6 hover:opacity-80 transition">
              <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="TrackTok Logo" width={40} height={40} className="w-full h-full object-cover" />
              </div>
              <span className="text-lg sm:text-2xl font-bold font-display text-primary">TrackTok</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {step === 'identifier' && 'Welcome'}
              {step === 'login' && 'Welcome Back'}
              {step === 'register' && (phoneAccountFound && googleCredential ? 'Link Account' : 'Create Account')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {step === 'identifier' && 'Enter your phone number or email to continue'}
              {step === 'login' && 'Enter your password to sign in'}
              {step === 'register' && (phoneAccountFound && googleCredential ? 'Link your Google email to your existing account' : 'Set up your new account')}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Identifier */}
            {step === 'identifier' && (
              <motion.form
                key="identifier"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleCheckAccount}
                className="card space-y-4 sm:space-y-6"
              >
                {error && (
                  <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="identifier" className="block text-xs sm:text-sm font-semibold mb-2">
                    Phone Number or Email
                  </label>
                  <div className="relative">
                    {isEmail(identifier) ? (
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <input
                      id="identifier"
                      type="text"
                      placeholder="you@example.com or 9876543210"
                      value={identifier}
                      onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                      required
                      autoFocus
                      autoComplete="username"
                      className="input-field pl-10 sm:pl-12 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifier.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Checking...' : 'Continue'}
                  {!loading && <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-3 bg-white dark:bg-dark-card text-gray-500">or</span>
                  </div>
                </div>

                <div ref={googleBtnRef} className="w-full flex justify-center" />
              </motion.form>
            )}

            {/* Step 2a: Login */}
            {step === 'login' && (
              <motion.form
                key="login"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="card space-y-4 sm:space-y-6"
              >
                {error && (
                  <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {identifierType === 'email' ? (
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{identifier}</span>
                  <button type="button" onClick={goBack} className="ml-auto text-xs text-primary hover:underline flex-shrink-0">
                    Change
                  </button>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                      required
                      autoFocus
                      className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {showPassword ? <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Eye className="w-4 sm:w-5 h-4 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <button type="button" onClick={goBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <a href="#" className="text-primary hover:underline font-semibold">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />}
                </button>
              </motion.form>
            )}

            {/* Step 2b: Register */}
            {step === 'register' && (
              <motion.form
                key="register"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="card space-y-3 sm:space-y-4"
              >
                {error && (
                  <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {identifierType === 'email' ? (
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  ) : (
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{identifier}</span>
                  <button type="button" onClick={goBack} className="ml-auto text-xs text-primary hover:underline flex-shrink-0">
                    Change
                  </button>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-primary font-medium">
                    No account found. Create one below.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(''); }}
                      required
                      autoFocus
                      autoComplete="name"
                      className="input-field pl-10 sm:pl-12 text-sm"
                    />
                  </div>
                </div>

                {/* Show email field if user entered phone, or phone field if user entered email */}
                {identifierType === 'phone' && (
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                      <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
                        required
                        autoComplete="email"
                        className="input-field pl-10 sm:pl-12 text-sm"
                      />
                    </div>
                  </div>
                )}

                {identifierType === 'email' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2 sm:gap-3">
                      <div className="w-20 sm:w-24">
                        <select
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          className="input-field text-xs sm:text-sm"
                        >
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+61">+61 (AU)</option>
                          <option value="+64">+64 (NZ)</option>
                          <option value="+27">+27 (ZA)</option>
                          <option value="+86">+86 (CN)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+33">+33 (FR)</option>
                          <option value="+49">+49 (DE)</option>
                          <option value="+39">+39 (IT)</option>
                          <option value="+34">+34 (ES)</option>
                        </select>
                      </div>
                      <div className="flex-1 relative">
                        <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                        <input
                          type="tel"
                          name="phone_number_field"
                          placeholder="10 digit number"
                          value={formData.phone}
                          onChange={(e) => {
                            if (/[a-zA-Z@]/.test(e.target.value)) return;
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setFormData({ ...formData, phone: val });
                            setError('');
                            if (googleCredential) checkPhoneExists(val);
                          }}
                          required
                          autoComplete="off"
                          data-form-type="other"
                          className="input-field pl-10 sm:pl-12 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {phoneAccountFound && googleCredential ? (
                  <>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Account found with this phone number. Your Google email <strong>{identifier}</strong> will be linked to this account.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                      <button type="button" onClick={goBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleLinkAccount}
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {loading ? 'Linking account...' : 'Link & Sign In'}
                      {!loading && <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Password */}
                    <div>
                      <label htmlFor="reg-password" className="block text-xs sm:text-sm font-semibold mb-2">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                        <input
                          id="reg-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
                          required
                          className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {showPassword ? <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" /> : <Eye className="w-4 sm:w-5 h-4 sm:h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                        <input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(''); }}
                          required
                          className="input-field pl-10 sm:pl-12 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                      <button type="button" onClick={goBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                      {!loading && <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />}
                    </button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
    </>
  );
}
