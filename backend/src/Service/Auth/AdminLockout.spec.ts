import { AuthService } from './Auth.service';
import { user } from '@Database/Table/Admin/user';
import { company } from '@Database/Table/Admin/company';

/**
 * In-memory Redis stand-in supporting the INCR/EXPIRE/TTL/DEL calls the lockout uses.
 */
function fakeRedis() {
  const values = new Map<string, number>();
  const ttls = new Map<string, number>();
  return {
    values,
    ttls,
    incr: jest.fn(async (k: string) => {
      const next = (values.get(k) || 0) + 1;
      values.set(k, next);
      return next;
    }),
    expire: jest.fn(async (k: string, s: number) => { ttls.set(k, s); return 1; }),
    ttl: jest.fn(async (k: string) => ttls.get(k) ?? -1),
    get: jest.fn(async (k: string) => (values.has(k) ? String(values.get(k)) : null)),
    del: jest.fn(async (k: string) => { values.delete(k); ttls.delete(k); return 1; })
  };
}

describe('Super admin login lockout', () => {
  let redis: ReturnType<typeof fakeRedis>;
  let service: AuthService;
  let hashing: { Compare: jest.Mock; Hash: jest.Mock };
  let alerts: { SendAlert: jest.Mock };
  let admin: any;

  beforeEach(() => {
    jest.clearAllMocks();
    redis = fakeRedis();
    hashing = { Compare: jest.fn().mockResolvedValue(false), Hash: jest.fn() };
    alerts = { SendAlert: jest.fn().mockResolvedValue(undefined) };

    service = new AuthService(
      { sign: jest.fn().mockReturnValue('jwt') } as any,
      {} as any,
      hashing as any,
      redis as any,
      alerts as any,
      {} as any
    );

    admin = {
      id: 'u1',
      email: 'admin@user.com',
      password: 'hashed',
      status: true,
      is_verified: true,
      failed_login_count: 0,
      two_factor_enabled: false,
      user_role: { code: 'SUPER_ADMIN' },
      user_role_id: 'r1',
      company: null,
      save: jest.fn().mockResolvedValue(undefined)
    };

    jest.spyOn(user, 'findOne').mockResolvedValue(admin as any);
    // A SUPER_ADMIN with no linked company falls back to a workspace lookup on success.
    jest.spyOn(company, 'find').mockResolvedValue([] as any);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  const attemptBadPassword = () => service.ValidateUser('admin@user.com', 'wrong-password');

  it('rejects a wrong password without disabling the account', async () => {
    await expect(attemptBadPassword()).rejects.toThrow('Invalid password');
    expect(admin.status).toBe(true);
  });

  it('never sets status=false, which had no self-service recovery', async () => {
    for (let i = 0; i < 7; i++) {
      await attemptBadPassword().catch(() => undefined);
    }
    // Permanently disabling the account is how a reviewer could lose access mid-review.
    expect(admin.status).toBe(true);
  });

  it('locks the account temporarily after 5 failed attempts', async () => {
    for (let i = 0; i < 4; i++) {
      await expect(attemptBadPassword()).rejects.toThrow('Invalid password');
    }
    await expect(attemptBadPassword()).rejects.toThrow(/Try again in 15 minute/);
  });

  it('refuses further attempts while the lockout is active', async () => {
    for (let i = 0; i < 5; i++) {
      await attemptBadPassword().catch(() => undefined);
    }
    // Even the correct password is refused until the window expires.
    hashing.Compare.mockResolvedValue(true);
    await expect(service.ValidateUser('admin@user.com', 'Login123!!')).rejects.toThrow(/Try again in/);
  });

  it('sends a security alert when the lockout engages', async () => {
    for (let i = 0; i < 5; i++) {
      await attemptBadPassword().catch(() => undefined);
    }
    expect(alerts.SendAlert).toHaveBeenCalledWith(
      'Admin Account Temporarily Locked',
      expect.stringContaining('admin@user.com')
    );
  });

  it('lets the user back in once the lockout expires', async () => {
    for (let i = 0; i < 5; i++) {
      await attemptBadPassword().catch(() => undefined);
    }
    // Simulate the Redis key expiring on its own — no admin intervention.
    redis.values.clear();
    redis.ttls.clear();

    hashing.Compare.mockResolvedValue(true);
    const result = await service.ValidateUser('admin@user.com', 'Login123!!');
    expect(result.api_token).toBe('jwt');
  });

  it('clears the counter after a successful sign-in', async () => {
    await attemptBadPassword().catch(() => undefined);
    hashing.Compare.mockResolvedValue(true);
    await service.ValidateUser('admin@user.com', 'Login123!!');
    expect(redis.del).toHaveBeenCalledWith('admin_login_lock:admin@user.com');
  });

  it('still refuses an account an administrator genuinely suspended', async () => {
    admin.status = false;
    await expect(service.ValidateUser('admin@user.com', 'Login123!!'))
      .rejects.toThrow(/suspended/);
  });

  it('does not lock out non-admin users', async () => {
    admin.user_role = { code: 'CLIENT_ADMIN' };
    for (let i = 0; i < 6; i++) {
      await expect(attemptBadPassword()).rejects.toThrow('Invalid password');
    }
    expect(redis.incr).not.toHaveBeenCalled();
  });

  it('does not lock anyone out when Redis is unavailable', async () => {
    redis.incr.mockRejectedValue(new Error('redis down'));
    redis.get.mockRejectedValue(new Error('redis down'));
    for (let i = 0; i < 6; i++) {
      await expect(attemptBadPassword()).rejects.toThrow('Invalid password');
    }
  });
});
