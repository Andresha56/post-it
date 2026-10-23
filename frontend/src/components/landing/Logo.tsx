import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link to="/" aria-label="PostFlow home" className={cn('inline-flex items-center gap-2.5 rounded-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2', light ? 'text-white' : 'text-[var(--text)]', className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-[#F45B72] text-white"><Send size={17} /></span>
      <span className="text-lg">PostFlow</span>
    </Link>
  );
}
