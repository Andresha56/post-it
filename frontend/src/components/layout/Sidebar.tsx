import { NavLink } from 'react-router-dom';
import { Moon, Send, Sun, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';
import { links } from '../constant/social';
type Props = { mobileOpen: boolean; onClose: () => void };
export function Sidebar({ mobileOpen, onClose }: Props) {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation overlay" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[232px] flex-col border-r border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition-transform duration-200 lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2 font-semibold tracking-tight text-[var(--text)]">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Send size={15} /></span>
            <span className="text-base">Orbit</span>
          </NavLink>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose} aria-label="Close menu"><X size={18}/></Button>
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex h-8 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isActive ? 'bg-primary-light text-primary' : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span className="flex-1 truncate">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-3">
          <div className="flex items-center gap-2.5 px-1">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary-light text-xs font-semibold text-primary">R</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">Rinki's Workspace</p>
              <p className="text-xs text-[var(--text-muted)]">Pro plan · 5 members</p>
            </div>
          </div>
          <div className="mt-3 px-1">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>Posts this month</span><span className="tabular-nums">42 / 500</span></div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--surface-hover)]"><div className="h-full w-[8.4%] rounded-full bg-primary" /></div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => window.alert('Plan management will be connected to the backend later.')}>Upgrade plan</Button>
            <Button size="icon" variant="ghost" className="size-7" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
              {theme === 'light' ? <Moon size={15}/> : <Sun size={15}/>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
