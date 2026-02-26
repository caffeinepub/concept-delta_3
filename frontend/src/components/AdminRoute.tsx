import React, { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useHasAdminBeenVisited } from '../hooks/useQueries';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: hasVisited, isLoading: visitedLoading } = useHasAdminBeenVisited();
  const navigate = useNavigate();

  const isLoading = isInitializing || adminLoading || visitedLoading;

  useEffect(() => {
    if (!isLoading && identity && isAdmin && hasVisited === true) {
      toast.info('Admin panel is only accessible on first login.', {
        description: 'You have already visited the admin panel. Redirecting to dashboard.',
        duration: 5000,
      });
      navigate({ to: '/dashboard' });
    }
  }, [isLoading, identity, isAdmin, hasVisited, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!identity) {
    return <Navigate to="/" />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // If already visited, render nothing while the useEffect redirect fires
  if (hasVisited === true) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-navy-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
