import { useState } from 'react';
import { ArrowRight, Lightbulb, PencilLine, RefreshCw, Sparkles, Target, ChartNoAxesCombined } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

const actions = [
  { label: 'Generate Post Ideas', icon: Lightbulb, prompt: 'Suggest 5 post ideas for my audience.' },
  { label: 'Write a Caption', icon: PencilLine, prompt: 'Draft a social caption for a product update.' },
  { label: 'Repurpose Content', icon: RefreshCw, prompt: 'Adapt my latest post for other platforms.' },
  { label: 'Create a Campaign', icon: Target, prompt: 'Plan a 7-day social campaign.' },
  { label: 'Analyze Performance', icon: ChartNoAxesCombined, prompt: 'Summarize recent post performance.' }
];

export function AIAssistant() {
  const [active, setActive] = useState('Ideas');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Enter a topic or choose an AI action first.'); return; }
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    setResult(`Mock AI suggestion for: “${prompt.trim()}”\n\nStart with one clear idea, lead with a useful insight, and end with a question that invites your audience to join the conversation.`);
    setLoading(false);
    toast.success('Mock suggestion generated');
  };

  return (
    <Card>
      <CardHeader className="items-center">
        <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-rose-100 text-brand-600 dark:bg-rose-950"><Sparkles size={17}/></span><h2 className="font-bold text-[var(--text)]">AI Assistant</h2></div>
        <span className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-semibold text-brand-700 dark:bg-rose-950 dark:text-rose-200">Beta</span>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-3 grid grid-cols-4 gap-1 border-b border-[var(--border)] pb-2">
          {['Ideas', 'Write', 'Repurpose', 'Campaign'].map((tab) => <button key={tab} onClick={() => { setActive(tab); setPrompt(''); setResult(''); }} className={`rounded-lg px-1 py-2 text-[11px] font-medium ${active === tab ? 'bg-rose-50 text-brand-700 dark:bg-rose-950 dark:text-rose-200' : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)]'}`}>{tab}</button>)}
        </div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={500} placeholder={active === 'Ideas' ? 'What would you like to create today?' : `Tell AI what to ${active.toLowerCase()}...`} className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"/>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-[var(--text-muted)]">Tone<select className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text)]"><option>Professional</option><option>Friendly</option><option>Playful</option></select></label>
          <label className="text-xs text-[var(--text-muted)]">Length<select className="mt-1 block w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text)]"><option>Medium</option><option>Short</option><option>Long</option></select></label>
        </div>
        <Button className="mt-3 w-full" onClick={generate} disabled={loading}><Sparkles size={15}/>{loading ? 'Generating…' : 'Generate'}</Button>
        {result && <div className="mt-3 whitespace-pre-line rounded-xl bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--text)]">{result}<Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => { void navigator.clipboard?.writeText(result); toast.success('Copied suggestion'); }}>Copy suggestion</Button></div>}
        <div className="mt-4 space-y-1">
          {actions.map(({ label, icon: Icon, prompt: actionPrompt }) => <button key={label} onClick={() => { setActive(label.includes('Caption') ? 'Write' : label.includes('Campaign') ? 'Campaign' : label.includes('Repurpose') ? 'Repurpose' : 'Ideas'); setPrompt(actionPrompt); setResult(''); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-xs font-medium text-[var(--text)] hover:bg-[var(--surface-muted)]"><span className="grid size-8 place-items-center rounded-lg bg-rose-50 text-brand-600 dark:bg-rose-950"><Icon size={16}/></span><span className="flex-1">{label}</span><ArrowRight size={14} className="text-[var(--text-muted)]"/></button>)}
        </div>
      </CardContent>
    </Card>
  );
}
