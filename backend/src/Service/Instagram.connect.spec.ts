import { InstagramService, REQUIRED_SCOPES, WEBHOOK_FIELDS } from './Instagram.service';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const APP_ID = '955338716906984';
const APP_SECRET = 'test-secret';

function fakeRedis() {
  const store = new Map<string, string>();
  return {
    set: jest.fn(async (k: string, v: string) => { store.set(k, v); return 'OK'; }),
    get: jest.fn(async (k: string) => store.get(k) ?? null),
    del: jest.fn(async (k: string) => { store.delete(k); return 1; })
  };
}

/**
 * Routes the Graph calls linkInstagramAccount makes, in order, by URL.
 * `overrides` lets each test bend one response without restating the rest.
 */
function wireGraph(overrides: {
  debugToken?: any;
  pages?: any[];
  accountType?: string | null;
  grantedScopes?: string[];
  subscribeResult?: any;
  subscribeError?: Error;
} = {}) {
  const granted = overrides.grantedScopes ?? REQUIRED_SCOPES;

  mockedAxios.get.mockImplementation(async (url: string, config?: any) => {
    if (url.includes('/debug_token')) {
      // Both the connect-time app check and findMissingScopes hit this endpoint.
      return {
        data: {
          data: overrides.debugToken ?? { is_valid: true, app_id: APP_ID, scopes: granted }
        }
      } as any;
    }
    if (url.includes('/oauth/access_token')) {
      return { data: { access_token: 'LONG_LIVED_USER_TOKEN' } } as any;
    }
    if (url.includes('/me/accounts')) {
      return {
        data: {
          data: overrides.pages ?? [
            { id: 'PAGE_1', name: 'Acme Shop', access_token: 'PAGE_TOKEN_1', instagram_business_account: { id: 'IG_BIZ_1' } }
          ]
        }
      } as any;
    }
    if (url.endsWith('/me')) {
      return { data: { id: 'FB_USER_1' } } as any;
    }
    // Account eligibility lookup on the IG business id.
    if (config?.params?.fields?.includes('account_type')) {
      return {
        data: {
          id: 'IG_BIZ_1',
          username: 'acme',
          account_type: overrides.accountType === null ? undefined : (overrides.accountType ?? 'BUSINESS')
        }
      } as any;
    }
    return { data: {} } as any;
  });

  mockedAxios.post.mockImplementation(async (url: string) => {
    if (url.includes('/subscribed_apps')) {
      if (overrides.subscribeError) throw overrides.subscribeError;
      return { data: overrides.subscribeResult ?? { success: true } } as any;
    }
    return { data: {} } as any;
  });
}

describe('InstagramService.linkInstagramAccount', () => {
  let service: InstagramService;
  let savedCompany: any;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FB_APP_ID = APP_ID;
    process.env.FB_APP_SECRET = APP_SECRET;

    service = new InstagramService(
      { emitNewMessage: jest.fn() } as any,
      {} as any, {} as any, { SendMail: jest.fn() } as any,
      {} as any, {} as any, fakeRedis() as any
    );

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    savedCompany = { id: 'company-1', save: jest.fn().mockResolvedValue(undefined) };
    jest.spyOn(CompanyTable, 'findOne').mockResolvedValue(savedCompany as any);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  describe('token validation', () => {
    it('connects successfully with a valid app-scoped token', async () => {
      wireGraph();
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');

      expect(res.Success).toBe(true);
      expect(res.Data.business_id).toBe('IG_BIZ_1');
      expect(res.Data.warnings).toEqual([]);
      expect(savedCompany.instagram_business_id).toBe('IG_BIZ_1');
      expect(savedCompany.instagram_page_id).toBe('PAGE_1');
    });

    it('rejects a token issued for a different Facebook app', async () => {
      // Token confusion: a token minted for someone else's app must not attach an account.
      wireGraph({ debugToken: { is_valid: true, app_id: '999999999', scopes: REQUIRED_SCOPES } });

      await expect(service.linkInstagramAccount('company-1', 'FOREIGN_TOKEN'))
        .rejects.toThrow('META_TOKEN_WRONG_APP');
    });

    it('rejects an invalid token', async () => {
      wireGraph({ debugToken: { is_valid: false } });
      await expect(service.linkInstagramAccount('company-1', 'DEAD_TOKEN'))
        .rejects.toThrow('META_TOKEN_INVALID');
    });

    it('refuses to connect when the server has no app credentials', async () => {
      delete process.env.FB_APP_SECRET;
      await expect(service.linkInstagramAccount('company-1', 'USER_TOKEN'))
        .rejects.toThrow('PLATFORM_CONFIG_MISSING');
    });

    it('records the authorising Meta user id for the data-deletion callback', async () => {
      wireGraph();
      await service.linkInstagramAccount('company-1', 'USER_TOKEN');
      expect(savedCompany.meta_user_id).toBe('FB_USER_1');
    });
  });

  describe('page selection', () => {
    const TWO_PAGES = [
      { id: 'PAGE_1', name: 'Acme Shop', access_token: 'T1', instagram_business_account: { id: 'IG_BIZ_1' } },
      { id: 'PAGE_2', name: 'Acme Spare', access_token: 'T2', instagram_business_account: { id: 'IG_BIZ_2' } }
    ];

    it('asks the user to choose when several eligible pages exist', async () => {
      // Previously this silently took the first page, which could connect the wrong account.
      wireGraph({ pages: TWO_PAGES });

      await expect(service.linkInstagramAccount('company-1', 'USER_TOKEN'))
        .rejects.toMatchObject({
          message: expect.stringContaining('META_MULTIPLE_PAGES'),
          choices: [
            { page_id: 'PAGE_1', page_name: 'Acme Shop', instagram_business_id: 'IG_BIZ_1' },
            { page_id: 'PAGE_2', page_name: 'Acme Spare', instagram_business_id: 'IG_BIZ_2' }
          ]
        });
    });

    it('connects the explicitly chosen page', async () => {
      wireGraph({ pages: TWO_PAGES });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN', 'PAGE_2');

      expect(res.Data.business_id).toBe('IG_BIZ_2');
      expect(savedCompany.instagram_page_id).toBe('PAGE_2');
    });

    it('rejects a page the user does not administer', async () => {
      wireGraph({ pages: TWO_PAGES });
      await expect(service.linkInstagramAccount('company-1', 'USER_TOKEN', 'PAGE_NOT_MINE'))
        .rejects.toThrow('META_PAGE_NOT_ELIGIBLE');
    });

    it('fails clearly when no page has a linked Instagram account', async () => {
      wireGraph({ pages: [{ id: 'PAGE_X', name: 'No IG', access_token: 'T' }] });
      await expect(service.linkInstagramAccount('company-1', 'USER_TOKEN'))
        .rejects.toThrow('META_NO_INSTAGRAM_LINKED');
    });
  });

  describe('webhook subscription', () => {
    it('subscribes the page with comma-separated fields, not a JSON array', async () => {
      wireGraph();
      await service.linkInstagramAccount('company-1', 'USER_TOKEN');

      const call = mockedAxios.post.mock.calls.find(c => String(c[0]).includes('/subscribed_apps'));
      expect(call).toBeDefined();
      expect(String(call![0])).toContain('/PAGE_1/subscribed_apps');
      expect(call![2]).toMatchObject({
        params: expect.objectContaining({ subscribed_fields: WEBHOOK_FIELDS.join(',') })
      });
      // Must include comments, or the comment automation never receives events.
      expect(call![2].params.subscribed_fields).toContain('comments');
    });

    it('warns when Meta rejects the subscription instead of swallowing it', async () => {
      const err: any = new Error('fail');
      err.response = { data: { error: { message: '(#200) Requires pages_manage_metadata' } } };
      wireGraph({ subscribeError: err });

      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');

      expect(res.Data.warnings.join(' ')).toContain('pages_manage_metadata');
      expect(res.Data.warnings.join(' ')).toContain('will not work');
    });

    it('warns when Meta does not confirm success', async () => {
      wireGraph({ subscribeResult: {} });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');
      expect(res.Data.warnings.join(' ')).toContain('did not confirm');
    });
  });

  describe('permission and eligibility reporting', () => {
    it('reports permissions the user did not grant', async () => {
      wireGraph({ grantedScopes: ['instagram_basic', 'pages_show_list'] });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');

      expect(res.Data.missing_scopes).toContain('pages_manage_metadata');
      expect(res.Data.missing_scopes).toContain('instagram_manage_comments');
      expect(res.Data.warnings.join(' ')).toContain('Missing Meta permissions');
    });

    it('accepts a BUSINESS account without complaint', async () => {
      wireGraph({ accountType: 'BUSINESS' });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');
      expect(res.Data.warnings).toEqual([]);
    });

    it('accepts a MEDIA_CREATOR account', async () => {
      wireGraph({ accountType: 'MEDIA_CREATOR' });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');
      expect(res.Data.warnings).toEqual([]);
    });

    it('warns when the linked account is not a professional account', async () => {
      wireGraph({ accountType: 'PERSONAL' });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');

      expect(res.Data.warnings.join(' ')).toContain('PERSONAL');
      expect(res.Data.warnings.join(' ')).toContain('Business or Creator');
    });

    it('does not complain when Meta omits account_type', async () => {
      // Absence of the field is not evidence of ineligibility.
      wireGraph({ accountType: null });
      const res = await service.linkInstagramAccount('company-1', 'USER_TOKEN');
      expect(res.Data.warnings).toEqual([]);
    });
  });

  it('never logs the page access token', async () => {
    wireGraph();
    await service.linkInstagramAccount('company-1', 'USER_TOKEN');

    const logged = (console.log as jest.Mock).mock.calls.flat().map(String).join(' ');
    expect(logged).not.toContain('PAGE_TOKEN_1');
  });
});
