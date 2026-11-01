import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Loader2, X } from 'lucide-react';
import type { AuthMode } from './types';

const inputCls =
    'h-10 w-full rounded-[12px] border border-orbit-border bg-orbit-background px-3.5 text-sm outline-none transition-colors placeholder:text-orbit-muted-foreground focus:border-orbit-brand/50';

export default function AuthModal({
    open,
    onOpenChange,
    mode,
    onModeChange,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    mode: AuthMode;
    onModeChange: (m: AuthMode) => void;
}) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (status !== 'idle') return;
        setStatus('loading');
        window.setTimeout(() => {
            setStatus('done');
            toast.success(
                mode === 'signup'
                    ? 'Welcome to Orbit — demo sign-up complete'
                    : 'Welcome back — demo login complete',
            );
            window.setTimeout(() => {
                onOpenChange(false);
                setStatus('idle');
            }, 1100);
        }, 900);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
                <Dialog.Content
                    data-testid="auth-modal"
                    className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[16px] border border-orbit-border bg-orbit-card p-8 shadow-[0_48px_90px_-30px_rgba(10,10,20,0.5)]"
                >
                    <Dialog.Close
                        data-testid="auth-modal-close"
                        aria-label="Close"
                        className="absolute right-4 top-4 grid size-8 place-items-center rounded-[10px] text-orbit-muted-foreground transition-colors hover:bg-orbit-foreground/5 hover:text-orbit-foreground"
                    >
                        <X className="size-4" />
                    </Dialog.Close>

                    <div className="flex flex-col items-center text-center">
                        <span className="grid size-10 place-items-center rounded-[10px] bg-primary text-primary-foreground">
                            <svg width="24" height="24" viewBox="0 0 30 30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M7 17 12.5 5.5 18 24.5 23.5 12.5" />
                                <path d="M7.5 21.5 11 14M19.5 19.5 23 11.5" strokeWidth="1.8" opacity=".7" />
                            </svg>
                        </span>
                        <Dialog.Title className="orbit-font-display mt-4 text-2xl font-semibold tracking-tight">
                            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
                        </Dialog.Title>
                        <Dialog.Description className="mt-1.5 text-sm text-orbit-muted-foreground">
                            {mode === 'signup'
                                ? 'Start managing all your social media in one place.'
                                : 'Log in to your Orbit workspace.'}
                        </Dialog.Description>
                    </div>

                    <div className="mt-6 grid grid-cols-2 rounded-[12px] border border-orbit-border bg-orbit-surface p-1">
                        {(['signup', 'login'] as AuthMode[]).map((m) => (
                            <button
                                key={m}
                                data-testid={`auth-tab-${m}`}
                                type="button"
                                onClick={() => onModeChange(m)}
                                className={`rounded-[10px] py-1.5 text-sm font-medium transition-all ${
                                    mode === m
                                        ? 'bg-orbit-card text-orbit-foreground shadow-sm'
                                        : 'text-orbit-muted-foreground'
                                }`}
                            >
                                {m === 'signup' ? 'Sign up' : 'Log in'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submit} className="mt-5 space-y-3">
                        {mode === 'signup' && (
                            <input
                                data-testid="auth-input-name"
                                type="text"
                                required
                                placeholder="Full name"
                                className={inputCls}
                            />
                        )}
                        <input
                            data-testid="auth-input-email"
                            type="email"
                            required
                            placeholder="you@company.com"
                            className={inputCls}
                        />
                        <input
                            data-testid="auth-input-password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="Password"
                            className={inputCls}
                        />
                        <button
                            data-testid="auth-submit-button"
                            type="submit"
                            disabled={status !== 'idle'}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-orbit-brand text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                        >
                            {status === 'loading' ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : status === 'done' ? (
                                <>
                                    <Check className="size-4" /> You&apos;re in
                                </>
                            ) : mode === 'signup' ? (
                                'Create free account'
                            ) : (
                                'Log in'
                            )}
                        </button>
                    </form>

                    <div className="mt-5 flex items-center gap-3">
                        <span className="h-px flex-1 bg-orbit-border" />
                        <span className="orbit-font-mono text-[10px] uppercase tracking-wider text-orbit-muted-foreground">
                            or continue with
                        </span>
                        <span className="h-px flex-1 bg-orbit-border" />
                    </div>

                    <button
                        data-testid="auth-oauth-google"
                        type="button"
                        onClick={() => toast.success('Google sign-in (demo)')}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-[12px] border border-orbit-border bg-orbit-background text-sm font-medium transition-colors hover:border-orbit-brand/40"
                    >
                        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                            <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.6z" />
                            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5.1l-3.9 2.9C3.3 21.2 7.3 24 12 24z" />
                            <path fill="#FBBC05" d="M5.2 14.3c-.3-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.3 6.8C.5 8.4 0 10.1 0 12s.5 3.6 1.3 5.2l3.9-2.9z" />
                            <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.8 1.3 6.8l3.9 2.9c.9-3 3.6-5 6.8-5z" />
                        </svg>
                        Google
                    </button>

                    <p className="orbit-font-mono mt-5 text-center text-[10px] uppercase tracking-wider text-orbit-muted-foreground">
                        Demo preview — no real account is created
                    </p>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
