import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { api } from '../../lib/api';
import { useAuthStore, type User } from './useAuthStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Using the exact logo from the sample.html mockup
  const LOGO_URL = "/favicon.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        const token = response.data.data.token;
        // Decode JWT payload to extract user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          tenantId: payload.subdomain,
        };
        useAuthStore.getState().setAuth(token, user);
        navigate({ to: '/dashboard' });
      } else {
        setError(response.data.error || 'Authentication failed');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-background text-on-surface font-body-base antialiased">
      {/* Left Column: Branding & Imagery */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-highest overflow-hidden items-center justify-center">
        {/* Background Image Area */}
        <div className="absolute inset-0 z-0">
          {/* Gradient Overlay for integration */}
          <div className="absolute inset-0 bg-linear-to-br from-background/90 via-background/60 to-surface-container-highest/80"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-12 max-w-xl w-full flex flex-col items-start gap-stack-lg">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-stack-sm mb-8">
            <img
              src={LOGO_URL}
              alt="Kaung Thant Enterprise Logo"
              className="w-48 h-48 rounded-xl object-contain bg-surface-container-lowest/50 p-6 border border-outline/20 shadow-2xl backdrop-blur-md"
            />
          </div>

          {/* Value Proposition Area */}
          <div className="space-y-6">
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-white">
              Kaung Thant Enterprise Platform
            </h1>
            <h2 className="font-display-lg text-display-lg font-extrabold text-white leading-tight">
              Bank-grade Security.<br />
              <span className="text-primary-container">Modern Velocity.</span>
            </h2>
            <p className="font-body-base text-body-base font-normal text-on-surface-variant max-w-md">
              Access your secure command center. Our platform integrates institutional stability with cutting-edge real-time processing capabilities.
            </p>
          </div>

          {/* Feature List */}
          <ul className="space-y-4 mt-8">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">encrypted</span>
              <span className="font-title-sm text-title-sm font-semibold text-on-surface">End-to-end Encryption</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">speed</span>
              <span className="font-title-sm text-title-sm font-semibold text-on-surface">Real-time Data Processing</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary-container">policy</span>
              <span className="font-title-sm text-title-sm font-semibold text-on-surface">Compliance Ready</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-4 mb-8">
            <img
              src={LOGO_URL}
              alt="Kaung Thant Enterprise Logo"
              className="w-16 h-16 rounded-lg object-contain bg-surface-container-highest p-2 border border-white/10"
            />
            <h1 className="font-headline-md text-headline-md tracking-tight text-white">
              Kaung Thant Enterprise
            </h1>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="font-headline-md text-headline-md text-white">Sign In</h2>
            <p className="font-body-base text-body-base text-on-surface-variant">Enter your credentials to access the secure portal.</p>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-error font-body-base text-sm flex items-start gap-3">
              <span className="material-symbols-outlined text-lg">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block font-code-sm text-code-sm text-on-surface" htmlFor="email">Corporate Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  className="block w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-colors font-body-base text-body-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-code-sm text-code-sm text-on-surface" htmlFor="password">Password</label>
                <a className="font-code-sm text-code-sm text-secondary hover:text-secondary-fixed transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-lg text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-colors font-body-base text-body-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary-container focus:ring-primary-container focus:ring-offset-background"
              />
              <label className="ml-2 block font-body-base text-body-base text-on-surface-variant" htmlFor="remember-me">
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-title-sm text-title-sm text-white bg-primary-container hover:bg-primary-container/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-container focus:ring-offset-background transition-all duration-200"
              type="submit"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate Context'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-4">
            <p className="font-body-base text-body-base text-on-surface-variant text-center">
              Need access? <a className="text-secondary hover:text-secondary-fixed font-title-sm text-title-sm transition-colors" href="#">Contact Administrator</a>
            </p>
            <div className="flex gap-4 font-label-caps text-label-caps text-on-surface-variant/70">
              <a className="hover:text-white transition-colors uppercase tracking-widest" href="#">Privacy Policy</a>
              <span>•</span>
              <a className="hover:text-white transition-colors uppercase tracking-widest" href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
