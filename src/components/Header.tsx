import { ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { ViewRole } from '@/types';

const tabs: { role: ViewRole; label: string; icon: typeof User }[] = [
  { role: 'patient', label: 'Patient View', icon: User },
  { role: 'insurer', label: 'Insurer View', icon: ShieldCheck },
];

export function Header() {
  const { role, switchRole, user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft">
            <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <p className="font-display text-base font-bold text-slate-900">ClaimFlow</p>
            <p className="text-[11px] font-medium text-slate-500">Claims Management Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 p-1 sm:flex">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = role === t.role;
              return (
                <button
                  key={t.role}
                  onClick={() => switchRole(t.role)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-white text-brand-700 shadow-soft'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-soft">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-semibold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile role switcher */}
      <div className="border-t border-slate-100 px-4 py-2 sm:hidden">
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = role === t.role;
            return (
              <button
                key={t.role}
                onClick={() => switchRole(t.role)}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-white text-brand-700 shadow-soft' : 'text-slate-500'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
