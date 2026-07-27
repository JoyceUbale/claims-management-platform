import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { MockUser, ViewRole } from '@/types';

interface AuthContextValue {
  user: MockUser;
  role: ViewRole;
  switchRole: (role: ViewRole) => void;
}

const PATIENT_USER: MockUser = {
  role: 'patient',
  name: 'Sarah Johnson',
  email: 'patient@example.com',
  title: 'Patient',
};

const INSURER_USER: MockUser = {
  role: 'insurer',
  name: 'Michael Chen',
  email: 'insurer@example.com',
  title: 'Claims Adjuster',
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ViewRole>('patient');

  const user = role === 'patient' ? PATIENT_USER : INSURER_USER;

  const switchRole = useCallback((next: ViewRole) => setRole(next), []);

  const value = useMemo<AuthContextValue>(() => ({ user, role, switchRole }), [user, role, switchRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
