import { NavLink } from 'react-router-dom';
import {ChevronDown, Moon, Send, Sun, X} from 'lucide-react';
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
        'fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col border-r border-white/10 bg-[#321923] text-white transition-transform duration-200 lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
          <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5 font-bold tracking-tight text-white">
            <span className="grid size-9 place-items-center rounded-xl bg-[#F45B72]"><Send size={19} /></span>
            <span className="text-xl">PostFlow</span>
          </NavLink>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" onClick={onClose} aria-label="Close menu"><X size={18}/></Button>
        </div>
        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {links.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) => cn(
                'group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition',
                isActive ? 'bg-[#F45B72]/20 text-[#FFB4C0] ring-1 ring-inset ring-[#F45B72]/20' : 'text-white/75 hover:bg-white/8 hover:text-white'
              )}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {label === 'Content' && <ChevronDown size={15} className="opacity-60" />}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-[#F45B72] font-semibold">R</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Rinki's Workspace</p>
                <p className="mt-0.5 text-xs text-white/60">Pro Plan · 5 Members</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/70"><span>Posts this month</span><span>42 / 500</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[24%] rounded-full bg-[#F45B72]" /></div>
            <Button className="mt-4 w-full bg-[#F45B72] hover:bg-[#df405a]" onClick={() => window.alert('Plan management will be connected to the backend later.')}>Upgrade Plan</Button>
          </div>
          <Button variant="ghost" className="mt-3 w-full justify-start text-white/75 hover:bg-white/10 hover:text-white" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}
            Switch to {theme === 'light' ? 'dark' : 'light'} theme
          </Button>
        </div>
      </aside>
    </>
  );
}
