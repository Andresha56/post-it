import { useState, type ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="min-h-screen lg:pl-[252px]">
        <Topbar onMenuClick={() => setMobileOpen(true)} onCreateClick={() => navigate('/create')} onSearch={setSearch}/>
        <main className="mx-auto w-full max-w-[1800px] p-4 md:p-6">
          <Outlet context={{ search } satisfies { search: string }} />
        </main>
      </div>
    </div>
  );
}

export function PageHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">{title}</h1>{description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}</div>{actions}</div>;
}
