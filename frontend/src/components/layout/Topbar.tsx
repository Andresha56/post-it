import { Bell, Menu, Plus, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

type Props = { onMenuClick: () => void; onCreateClick: () => void; onSearch: (value: string) => void };
export function Topbar({ onMenuClick, onCreateClick, onSearch }: Props) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation"><Menu size={20}/></Button>
      <label className="flex h-10 min-w-0 max-w-[600px] flex-1 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 text-[var(--text-muted)]">
        <Search size={17} />
        <input aria-label="Search posts, media, or analytics" placeholder="Search posts, media, analytics..." className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" onChange={(event) => onSearch(event.target.value)} />
      </label>
      <div className="ml-auto flex shrink-0 items-center gap-1.5 md:gap-3">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={toggleTheme} aria-label="Toggle theme">{theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}</Button>
        <Button onClick={onCreateClick} className="h-10 px-3 sm:px-4"><Plus size={17}/><span className="hidden sm:inline">Create Post</span></Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" onClick={() => window.alert('You are all caught up!')} className="relative"><Bell size={18}/><span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-[var(--surface)]"/></Button>
        <div className="hidden items-center gap-2.5 pl-1 sm:flex">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=80" alt="" className="size-9 rounded-full object-cover"/>
          <div className="hidden xl:block"><p className="text-sm font-semibold text-[var(--text)]">Rinki</p><p className="text-xs text-[var(--text-muted)]">Workspace Owner</p></div>
        </div>
      </div>
    </header>
  );
}
