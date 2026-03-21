import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to standard dashboard if user is not an admin
  if (!user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Only render children if user is an admin
  return <Outlet />;
};

export default AdminRoute;
