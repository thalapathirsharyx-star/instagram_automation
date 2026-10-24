import { SecretColumnTransformer } from './SecretColumn.transformer';

describe('SecretColumnTransformer', () => {
  const originalKey = process.env.SECERT_KEY;

  beforeEach(() => {
    process.env.SECERT_KEY = 'unit-test-encryption-key';
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.SECERT_KEY = originalKey;
    jest.restoreAllMocks();
  });

  it('round-trips a Meta access token', () => {
    const token = 'EAAG1234567890abcdefGHIJKLMNOP';
    const stored = SecretColumnTransformer.to(token);
    expect(SecretColumnTransformer.from(stored)).toBe(token);
  });

  it('does not store the token in a readable form', () => {
    const token = 'EAAG1234567890abcdefGHIJKLMNOP';
    const stored = SecretColumnTransformer.to(token) as string;
    expect(stored).not.toContain(token);
    expect(stored.startsWith('enc:v1:')).toBe(true);
  });

  it('produces a different ciphertext each time (random IV)', () => {
    const a = SecretColumnTransformer.to('same-token');
    const b = SecretColumnTransformer.to('same-token');
    expect(a).not.toBe(b);
    expect(SecretColumnTransformer.from(a)).toBe('same-token');
    expect(SecretColumnTransformer.from(b)).toBe('same-token');
  });

  it('reads a legacy plaintext row unchanged', () => {
    // Rows written before encryption was introduced must keep working so existing
    // connected accounts do not break on deploy.
    expect(SecretColumnTransformer.from('EAAG-legacy-plaintext-token')).toBe('EAAG-legacy-plaintext-token');
  });

  it('re-encrypts a legacy value on its next write', () => {
    const stored = SecretColumnTransformer.to('EAAG-legacy-plaintext-token') as string;
    expect(stored.startsWith('enc:v1:')).toBe(true);
  });

  it('does not double-encrypt an already enveloped value', () => {
    const once = SecretColumnTransformer.to('token') as string;
    const twice = SecretColumnTransformer.to(once);
    expect(twice).toBe(once);
  });

  it.each([null, undefined, ''])('passes through %p untouched', value => {
    expect(SecretColumnTransformer.to(value as any)).toBe(value === undefined ? null : value);
    expect(SecretColumnTransformer.from(value as any)).toBe(value === undefined ? null : value);
  });

  it('returns null rather than garbage when the key is wrong', () => {
    const stored = SecretColumnTransformer.to('token') as string;
    process.env.SECERT_KEY = 'a-completely-different-key';
    expect(SecretColumnTransformer.from(stored)).toBeNull();
  });

  it('stores plaintext and logs loudly when no key is configured', () => {
    delete process.env.SECERT_KEY;
    expect(SecretColumnTransformer.to('token')).toBe('token');
    expect(console.error).toHaveBeenCalled();
  });
});
