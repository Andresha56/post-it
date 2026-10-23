import { useState, type FormEvent } from 'react';
import type { ZodType, ZodTypeDef } from 'zod';

type Errors<T> = Partial<Record<keyof T, string>>;

// Validates with a Zod schema and hands valid values to `onValid`.
// No authentication happens here: wire `onValid` to the backend when it exists.
export function useAuthForm<T extends Record<string, string>>(schema: ZodType<T, ZodTypeDef, unknown>, initial: T, onValid: (values: T) => void | Promise<void>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof T) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Errors<T> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof T;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try { await onValid(parsed.data); } finally { setSubmitting(false); }
  };

  return { values, errors, submitting, setField, handleSubmit };
}
