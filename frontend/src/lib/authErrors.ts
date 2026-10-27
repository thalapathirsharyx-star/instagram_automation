/**
 * Turns a failed auth request into a message a person can act on.
 *
 * The backend's own `Message` is shown for ordinary rejections ("Invalid
 * credentials", "Please verify your email"), because it names the problem.
 * A request that never got an answer, or a server fault, gets a plain message
 * instead of axios's "Network Error" or a stack-trace-shaped 500 body.
 */
export const authErrorMessage = (err: unknown, fallback: string): string => {
  const error = err as { response?: { status?: number; data?: { Message?: string } } };
  if (!error?.response) {
    return "We couldn't reach Flazly. Check your connection and try again.";
  }
  if ((error.response.status ?? 0) >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  return error.response.data?.Message || fallback;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The same shape check the browser's `type="email"` makes, for inline errors. */
export const emailError = (value: string): string | undefined => {
  if (!value.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(value.trim())) return 'Enter a valid email address, like name@company.com.';
  return undefined;
};
