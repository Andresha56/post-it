import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Sparkles, Upload, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { SegmentedControl } from '../ui/SegmentedControl';
import { inputClass } from '../ui/Input';

export type PostMedia = { kind: 'image' | 'video'; url: string | null; name: string };
type Kind = PostMedia['kind'];
type Source = 'upload' | 'ai';

const accept: Record<Kind, string> = { image: 'image/*', video: 'video/*' };

// UI only: AI generation is mocked until the backend generation API exists.
const mockImage = (seed: string) => {
  const hue = [...seed].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,60%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360},70%,45%)"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export function MediaPreview({ media, className = '' }: { media: PostMedia; className?: string }) {
  if (media.kind === 'image' && media.url) return <img src={media.url} alt={media.name} className={`w-full rounded-lg object-cover ${className}`} />;
  if (media.kind === 'video' && media.url) return <video src={media.url} controls className={`w-full rounded-lg bg-black ${className}`} />;
  return (
    <div className={`grid aspect-video w-full place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)] ${className}`}>
      <span className="flex items-center gap-2 text-sm"><Video size={18} /> {media.name}</span>
    </div>
  );
}

export function MediaPicker({ media, onChange }: { media: PostMedia | null; onChange: (media: PostMedia | null) => void }) {
  const [kind, setKind] = useState<Kind>('image');
  const [source, setSource] = useState<Source>('upload');
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const objectUrl = useRef<string | null>(null);

  const release = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
  };
  useEffect(() => release, []);

  const handleFile = (file?: File) => {
    if (!file) return;
    release();
    objectUrl.current = URL.createObjectURL(file);
    onChange({ kind, url: objectUrl.current, name: file.name });
  };

  const generate = () => {
    if (!prompt.trim()) return toast.error(`Describe the ${kind} you want first.`);
    setGenerating(true);
    setTimeout(() => {
      release();
      onChange(kind === 'image'
        ? { kind, url: mockImage(prompt), name: 'AI generated image' }
        : { kind, url: null, name: 'AI generated video (preview coming soon)' });
      setGenerating(false);
      toast.success(`${kind === 'image' ? 'Image' : 'Video'} generated.`);
    }, 1500);
  };

  const remove = () => { release(); onChange(null); };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <SegmentedControl label="Media type" value={kind} onChange={setKind} options={[
          { value: 'image', label: 'Image', icon: <ImagePlus size={13} /> },
          { value: 'video', label: 'Video', icon: <Video size={13} /> }
        ]} />
        <SegmentedControl label="Media source" value={source} onChange={setSource} options={[
          { value: 'upload', label: 'Upload', icon: <Upload size={13} /> },
          { value: 'ai', label: 'Generate with AI', icon: <Sparkles size={13} /> }
        ]} />
      </div>

      {source === 'upload' ? (
        <>
          <input ref={fileInput} type="file" accept={accept[kind]} className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-[var(--border)] p-3 text-left transition-colors hover:border-brand-500 hover:bg-[var(--surface-muted)]"
          >
            <Upload size={18} className="text-[var(--text-muted)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text)]">Upload {kind}</p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">Click to choose a {kind} from your device.</p>
            </div>
          </button>
        </>
      ) : (
        <div className="flex gap-2">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label={`AI ${kind} prompt`} placeholder={`Describe the ${kind} to generate`} className={`${inputClass} font-normal`} />
          <Button variant="secondary" onClick={generate} disabled={generating}>
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {generating ? 'Generating…' : 'Generate'}
          </Button>
        </div>
      )}

      {media && (
        <div className="relative">
          <MediaPreview media={media} className="max-h-64" />
          <button type="button" aria-label="Remove media" onClick={remove} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
