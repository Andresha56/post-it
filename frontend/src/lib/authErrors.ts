// Maps Cognito/Amplify error names to messages that are safe to show to users.
import { MESSAGES } from '../constant/error';

export const errorName = (error: unknown) =>
  error instanceof Error ? error.name : "";

export function authErrorMessage(error: unknown): string {
  return (
    MESSAGES[errorName(error)] ?? "Something went wrong. Please try again."
  );
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}
