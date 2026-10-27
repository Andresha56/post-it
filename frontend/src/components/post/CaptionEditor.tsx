import { useState } from 'react';
import { Loader2, PenLine, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import { inputClass, labelClass, textareaClass } from '../ui/Input';

type Mode = 'manual' | 'ai';

// UI only: the AI call is mocked until the backend generation API exists.
const mockCaption = (prompt: string) =>
  `${prompt.trim()} — a small step today can lead to meaningful progress tomorrow. What are you working on this week?`;

export function CaptionEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [mode, setMode] = useState<Mode>('manual');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    if (!prompt.trim()) return toast.error('Describe what the post is about first.');
    setGenerating(true);
    setTimeout(() => {
      onChange(mockCaption(prompt));
      setGenerating(false);
      toast.success('Caption generated. You can edit it below.');
    }, 1200);
  };

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Caption source"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'manual', label: 'Write manually', icon: <PenLine size={13} /> },
          { value: 'ai', label: 'Generate with AI', icon: <Sparkles size={13} /> }
        ]}
      />
      {mode === 'ai' && (
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g. Announce our spring product launch"
            aria-label="AI caption prompt"
            className={`${inputClass} font-normal`}
          />
          <Button variant="secondary" onClick={generate} disabled={generating}>
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {generating ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      )}
      <label className={labelClass}>
        Caption
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={7}
          maxLength={500}
          placeholder="What would you like to share?"
          className={`${textareaClass} mt-1.5 font-normal`}
        />
      </label>
      <p className="text-xs text-[var(--text-muted)]">{value.length}/500 characters</p>
    </div>
  );
}
