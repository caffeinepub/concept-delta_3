import React, { useState } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Menu, X, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // useIsCallerAdmin: isLoading is true while actor/identity initializing OR query is fetching.
  // Once resolved, isLoading is false and data holds the boolean result.
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  // Show admin link only when:
  // - user is authenticated and identity is fully initialized
  // - admin check has completed (not loading)
  // - isAdmin is explicitly true
  const showAdmin =
    isAuthenticated &&
    !isInitializing &&
    !adminLoading &&
    isAdmin === true;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '';
        if (message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const navLinks = [
    { label: 'Home', path: '/', show: isAuthenticated },
    { label: 'Dashboard', path: '/dashboard', show: isAuthenticated },
    { label: 'Admin', path: '/admin', show: showAdmin },
  ];

  const isActive = (path: string) => location.pathname === path;

  const authButtonLabel = isLoggingIn
    ? 'Logging in...'
    : isAuthenticated
    ? 'Logout'
    : 'Login';

  return (
    <nav className="sticky top-0 z-50 bg-[#0A1F44] shadow-navy-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2.5 group"
          >
            <img
              src="/assets/generated/concept-delta-logo.dim_128x128.png"
              alt="Concept Delta logo"
              className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-white font-bold text-lg tracking-tight">
              Concept Delta
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter((l) => l.show).map((link) => (
              <button
                key={link.path}
                onClick={() => navigate({ to: link.path })}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Auth Button + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded border border-white text-white text-sm font-medium hover:bg-white hover:text-[#0A1F44] transition-colors disabled:opacity-50"
            >
              {isAuthenticated ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {authButtonLabel}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A1F44] border-t border-white/10 px-4 py-3 space-y-1">
          {navLinks.filter((l) => l.show).map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate({ to: link.path });
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-white/20 text-white'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                handleAuth();
                setMobileMenuOpen(false);
              }}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded border border-white text-white text-sm font-medium hover:bg-white hover:text-[#0A1F44] transition-colors disabled:opacity-50"
            >
              {isAuthenticated ? (
                <LogOut className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {authButtonLabel}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
