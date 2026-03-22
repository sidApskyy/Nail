import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AppRoot() {
  const navigate = useNavigate();
  const { hydrate, initializing, user, accessToken } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!initializing && accessToken && user) {
      if (user.role === 'admin') navigate('/');
      if (user.role === 'staff') navigate('/staff');
    }
  }, [initializing, accessToken, user, navigate]);

  return <Outlet />;
}
