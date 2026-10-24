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
      <div className="min-h-screen lg:pl-[232px]">
        <Topbar onMenuClick={() => setMobileOpen(true)} onCreateClick={() => navigate('/create')} onSearch={setSearch}/>
        <main className="mx-auto w-full max-w-[1600px] p-4 md:px-6 md:py-5">
          <Outlet context={{ search } satisfies { search: string }} />
        </main>
      </div>
    </div>
  );
}

export function PageHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>{description && <p className="mt-0.5 text-sm text-[var(--text-muted)]">{description}</p>}</div>{actions}</div>;
}
