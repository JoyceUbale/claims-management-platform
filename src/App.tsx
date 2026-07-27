import { useState } from 'react';
import { LayoutDashboard, PlusCircle, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { SubmitClaim } from '@/components/patient/SubmitClaim';
import { PatientDashboard } from '@/components/patient/PatientDashboard';
import { InsurerDashboard } from '@/components/insurer/InsurerDashboard';

type PatientView = 'dashboard' | 'submit';

function PatientApp() {
  const [view, setView] = useState<PatientView>('dashboard');

  return (
    <div>
      <nav className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-soft">
          <NavTab active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={LayoutDashboard} label="My Claims" />
          <NavTab active={view === 'submit'} onClick={() => setView('submit')} icon={PlusCircle} label="Submit Claim" />
        </div>
      </nav>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        {view === 'dashboard' ? (
          <PatientDashboard onNewClaim={() => setView('submit')} />
        ) : (
          <SubmitClaim onSubmitted={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}

function InsurerApp() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <InsurerDashboard />
    </main>
  );
}

function NavTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Shell() {
  const { role } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {role === 'patient' ? <PatientApp /> : <InsurerApp />}
      <footer className="border-t border-slate-200/70 bg-white/50 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-semibold text-slate-500">ClaimFlow</span>
            <span>— Claims Management Platform</span>
          </div>
          <p>Demo environment · Mock authentication · Data persists locally</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
