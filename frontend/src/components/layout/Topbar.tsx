import { Bell, Menu, Plus, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

type Props = { onMenuClick: () => void; onCreateClick: () => void; onSearch: (value: string) => void };
export function Topbar({ onMenuClick, onCreateClick, onSearch }: Props) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4 md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open navigation"><Menu size={18}/></Button>
      <label className="flex h-9 min-w-0 max-w-[480px] flex-1 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 text-[var(--text-muted)] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
        <Search size={15} />
        <input aria-label="Search posts, media, or analytics" placeholder="Search posts, media, analytics…" className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]" onChange={(event) => onSearch(event.target.value)} />
      </label>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">{theme === 'light' ? <Moon size={16}/> : <Sun size={16}/>}</Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" title="Notifications" onClick={() => window.alert('You are all caught up!')} className="relative"><Bell size={16}/><span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary"/></Button>
        <Button onClick={onCreateClick} className="ml-2"><Plus size={15}/><span className="hidden sm:inline">Create post</span></Button>
        <div className="ml-3 hidden items-center gap-2 border-l border-[var(--border)] pl-3 sm:flex">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=80" alt="" className="size-7 rounded-full object-cover"/>
          <div className="hidden xl:block"><p className="text-[13px] font-medium leading-4 text-[var(--text)]">Andresha</p><p className="text-xs leading-4 text-[var(--text-muted)]">Workspace owner</p></div>
        </div>
      </div>
    </header>
  );
}
