import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    // Add floating animation to inputs
    const timer = setTimeout(() => {
      const inputs = document.querySelectorAll('.animate-float-in');
      inputs.forEach((input, index) => {
        setTimeout(() => {
          input.style.opacity = '1';
          input.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email: email.trim(), password: password.trim() });
      if (user.role === 'admin') navigate('/');
      if (user.role === 'staff') navigate('/staff');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-orange-300 via-peach-400 to-pink-400">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-peach-500/30 to-pink-500/30 animate-pulse" />
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='1'%3E%3Cpath d='M30 30L45 15L30 0L15 15L30 30'/%3E%3Cpath d='M45 45L60 30L45 60L30 45'/%3E%3C/g%3E%3C/svg%3E")` }} />
      </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: `linear-gradient(135deg, rgba(${251 + i * 5}, ${207 + i * 10}, ${232}, 0.1) 0%, rgba(${251 + i * 5}, ${207 + i * 10}, ${232}, 0.05) 100%)`,
              borderRadius: '50%',
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 5}s`
            }}
          />
        ))}
      </div>

      {/* Moving gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full blur-2xl"
            style={{
              width: `${300 + i * 80}px`,
              height: `${300 + i * 80}px`,
              background: `radial-gradient(circle, rgba(${255 - i * 30}, ${182 - i * 20}, ${193}, 0.6) 0%, rgba(${255 - i * 30}, ${182 - i * 20}, ${193}, 0.1) 70%)`,
              left: `${-30 + i * 25}%`,
              top: `${-20 + i * 30}%`,
              animation: `move-orb-${i % 3} ${15 + i * 3}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Floating bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/30 backdrop-blur-md border border-white/20"
            style={{
              width: `${15 + Math.random() * 35}px`,
              height: `${15 + Math.random() * 35}px`,
              left: `${Math.random() * 100}%`,
              bottom: '-50px',
              animation: `rise-up ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 6}s`,
              boxShadow: '0 4px 6px rgba(255, 182, 193, 0.3)'
            }}
          />
        ))}
      </div>

      {/* Large floating shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: `${60 + Math.random() * 40}px`,
              height: `${60 + Math.random() * 40}px`,
              left: `${5 + i * 12}%`,
              top: `${10 + (i % 4) * 20}%`,
              animation: `float-shape-${i % 4} ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1.5}s`
            }}
          >
            <div 
              className="w-full h-full border-3 bg-gradient-to-br from-orange-300/20 to-pink-300/20 backdrop-blur-sm"
              style={{
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '30%' : '10%',
                borderColor: `rgba(255, 182, 193, ${0.3 + i * 0.1})`,
                transform: `rotate(${i * 45}deg)`,
                boxShadow: '0 8px 32px rgba(255, 182, 193, 0.2)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Particle system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute"
            style={{
              width: `${3 + Math.random() * 4}px`,
              height: `${3 + Math.random() * 4}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 182, 193, 0.4) 100%)`,
              borderRadius: '50%',
              animation: `particle-float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 6px rgba(255, 182, 193, 0.6)'
            }}
          />
        ))}
      </div>

      {/* Wave effect */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-orange-400/30 via-pink-300/20 to-transparent animate-wave" />
      
      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={`ray-${i}`}
            className="absolute"
            style={{
              width: '2px',
              height: '100vh',
              left: `${10 + i * 18}%`,
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 182, 193, 0.3) 50%, transparent 100%)',
              transform: `rotate(${15 - i * 5}deg)`,
              animation: `ray-pulse ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-20 w-full max-w-md animate-fade-in">
        {/* Logo section with animation */}
        <div className="text-center mb-8 animate-bounce-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full shadow-2xl animate-pulse-slow">
            <div className="text-white text-2xl font-bold">NH</div>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-orange-800 animate-slide-up">
            Nail House Pune
          </h1>
          <p className="mt-2 text-orange-600 animate-slide-up-delay-1">
            Premium Nail Salon Management System
          </p>
        </div>

        <Card title="Welcome Back" className="shadow-2xl backdrop-blur-xl bg-white/95 border border-white/20 animate-scale-in">
          <div className="mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 mb-2">Sign in to your account</div>
              <p className="text-sm text-gray-600">Enter your credentials to access the management system</p>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className={`animate-float-in transition-all duration-300 ${focusedField === 'email' ? 'transform scale-105 shadow-lg' : ''}`}>
              <Input 
                label="Email Address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                className="relative"
              />
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-orange-500 rounded-full animate-ping" style={{ display: focusedField === 'email' ? 'block' : 'none' }} />
            </div>
            
            <div className={`animate-float-in transition-all duration-300 ${focusedField === 'password' ? 'transform scale-105 shadow-lg' : ''}`}>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                className="relative"
              />
              <div className="absolute -top-2 -right-2 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ display: focusedField === 'password' ? 'block' : 'none' }} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-8 8 8 8 0 01-8-8zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform transition-all duration-300 hover:scale-105" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="animate-pulse">Authenticating...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4 4m0 0l4 4m4 4v11M3 13h8a1 1 0 011 1v2a1 1 0 011-1H3a1 1 0 00-1-1V8a1 1 0 01-1-1H3z" />
                  </svg>
                  <span>Sign in</span>
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Secure login powered by{' '}
              <span className="font-semibold text-orange-600">advanced encryption</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
