import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, PencilLine, RefreshCw, Target, ChartNoAxesCombined } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { inputClass, textareaClass } from '../ui/Input';
import { cn } from '../../lib/utils';
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
  const navigate = useNavigate();
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
        <CardTitle title="AI assistant" description="Draft ideas and captions (preview)" />
        <Button variant="ghost" size="sm" onClick={() => navigate('/ai-studio')}>Open AI Studio</Button>
      </CardHeader>
      <CardContent className="pt-3">
        <div role="tablist" aria-label="Assistant mode" className="mb-3 grid grid-cols-4 gap-0.5 rounded-lg bg-[var(--surface-muted)] p-0.5">
          {['Ideas', 'Write', 'Repurpose', 'Campaign'].map((tab) => <button key={tab} role="tab" aria-selected={active === tab} onClick={() => { setActive(tab); setPrompt(''); setResult(''); }} className={cn('h-7 rounded-md text-xs font-medium transition-colors', active === tab ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]')}>{tab}</button>)}
        </div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} maxLength={500} aria-label="Prompt" placeholder={active === 'Ideas' ? 'What would you like to create today?' : `Tell AI what to ${active.toLowerCase()}…`} className={cn(textareaClass, 'resize-y')}/>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-[var(--text-muted)]">Tone<select className={cn(inputClass, 'mt-1 h-8 text-xs')}><option>Professional</option><option>Friendly</option><option>Playful</option></select></label>
          <label className="text-xs text-[var(--text-muted)]">Length<select className={cn(inputClass, 'mt-1 h-8 text-xs')}><option>Medium</option><option>Short</option><option>Long</option></select></label>
        </div>
        <Button className="mt-3 w-full" onClick={generate} disabled={loading}>{loading ? 'Generating…' : 'Generate'}</Button>
        {result && <div className="mt-3 whitespace-pre-line rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--text)]">{result}<Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => { void navigator.clipboard?.writeText(result); toast.success('Copied suggestion'); }}>Copy suggestion</Button></div>}
        <div className="mt-3 border-t border-[var(--border)] pt-2">
          <p className="px-2 pb-1 text-xs text-[var(--text-muted)]">Quick prompts</p>
          {actions.map(({ label, icon: Icon, prompt: actionPrompt }) => <button key={label} onClick={() => { setActive(label.includes('Caption') ? 'Write' : label.includes('Campaign') ? 'Campaign' : label.includes('Repurpose') ? 'Repurpose' : 'Ideas'); setPrompt(actionPrompt); setResult(''); }} className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[13px] text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)]"><Icon size={14} className="text-[var(--text-muted)]"/><span className="flex-1">{label}</span></button>)}
        </div>
      </CardContent>
    </Card>
  );
}
