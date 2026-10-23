import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/auth/AuthShell';
import { TextField } from '../components/auth/TextField';
import { useAuthForm } from '../components/auth/useAuthForm';
import { Button } from '../components/ui/Button';
import { signUpSchema } from '../types';

export default function SignUpPage() {
  const [notice, setNotice] = useState('');
  const form = useAuthForm(signUpSchema, { name: '', email: '', password: '' }, () => {
    // TODO: call the real registration endpoint here. Intentionally does not create an account.
    setNotice('Registration is not connected to a backend yet.');
  });
  return (
    <AuthShell
      title="Create your account"
      description="Start scheduling posts in a few minutes."
      footer={<>Already have an account? <Link to="/signin" className="font-semibold text-brand-600 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
        <TextField label="Name" name="name" autoComplete="name" value={form.values.name} onChange={form.setField('name')} error={form.errors.name} />
        <TextField label="Email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={form.values.email} onChange={form.setField('email')} error={form.errors.email} />
        <TextField label="Password" type="password" name="password" autoComplete="new-password" value={form.values.password} onChange={form.setField('password')} error={form.errors.password} />
        {notice && <p role="status" className="rounded-xl bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm text-[var(--text-muted)]">{notice}</p>}
        <Button type="submit" className="w-full" disabled={form.submitting}>Create account</Button>
      </form>
    </AuthShell>
  );
}
