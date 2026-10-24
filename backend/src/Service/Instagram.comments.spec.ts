import { InstagramService } from './Instagram.service';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { comment_trigger } from '@Database/Table/CRM/comment_trigger';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * Minimal in-memory Redis stand-in that honours SET ... NX, which is what the
 * comment de-duplication relies on.
 */
function fakeRedis() {
  const store = new Map<string, string>();
  return {
    store,
    set: jest.fn(async (key: string, value: string, _ex?: any, _ttl?: any, mode?: string) => {
      if (mode === 'NX' && store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    }),
    get: jest.fn(async (key: string) => store.get(key) ?? null)
  };
}

function buildService(redis: any) {
  return new InstagramService(
    { emitNewMessage: jest.fn() } as any,
    { generateAiReply: jest.fn(), analyzeStoryOcrText: jest.fn() } as any,
    {} as any,
    { SendMail: jest.fn() } as any,
    {} as any,
    {} as any,
    redis
  );
}

describe('InstagramService comment webhook handling', () => {
  let redis: ReturnType<typeof fakeRedis>;
  let service: InstagramService;

  const CONNECTED_COMPANY = {
    id: 'company-1',
    instagram_business_id: 'IG_BIZ_1',
    instagram_page_id: 'PAGE_1',
    instagram_access_token: 'page-token'
  };

  beforeEach(() => {
    // jest.mock('axios') mocks are module-level, so recorded calls survive
    // restoreAllMocks and must be cleared explicitly.
    jest.clearAllMocks();

    redis = fakeRedis();
    service = buildService(redis);

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    jest.spyOn(CompanyTable, 'findOne').mockResolvedValue(CONNECTED_COMPANY as any);
    jest.spyOn(comment_trigger, 'find').mockResolvedValue([
      { id: 't1', company_id: 'company-1', keyword: 'PRICE', reply_message: 'DM sent!', is_active: true } as any
    ]);
    jest.spyOn(instagram_lead, 'findOne').mockResolvedValue({
      id: 'lead-1', company_id: 'company-1', instagram_handle: 'USER_1', save: jest.fn()
    } as any);
    jest.spyOn(instagram_message.prototype as any, 'save').mockResolvedValue(undefined);

    mockedAxios.post.mockResolvedValue({ data: { id: 'reply-1' } } as any);
  });

  afterEach(() => jest.restoreAllMocks());

  function comment(overrides: any = {}) {
    return {
      id: 'COMMENT_1',
      text: 'What is the PRICE?',
      from: { id: 'USER_1', username: 'shopper' },
      media: { id: 'MEDIA_1' },
      ...overrides
    };
  }

  it('replies once to a comment matching an active keyword', async () => {
    await service.processIncomingComment(comment(), 'IG_BIZ_1');
    expect(mockedAxios.post).toHaveBeenCalled();
    const calledUrls = mockedAxios.post.mock.calls.map(c => String(c[0]));
    expect(calledUrls.some(u => u.includes('/COMMENT_1/private_replies'))).toBe(true);
  });

  it('ignores a comment authored by the connected Instagram account', async () => {
    // Our own public fallback reply arrives back as a `comments` event. Acting on it
    // would make the app reply to itself in a loop.
    await service.processIncomingComment(comment({ from: { id: 'IG_BIZ_1' } }), 'IG_BIZ_1');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('ignores a comment authored by the connected Facebook Page', async () => {
    await service.processIncomingComment(comment({ from: { id: 'PAGE_1' } }), 'IG_BIZ_1');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('ignores a duplicate delivery of the same comment', async () => {
    await service.processIncomingComment(comment(), 'IG_BIZ_1');
    const firstCallCount = mockedAxios.post.mock.calls.length;
    expect(firstCallCount).toBeGreaterThan(0);

    // Meta redelivers the identical event.
    await service.processIncomingComment(comment(), 'IG_BIZ_1');
    expect(mockedAxios.post.mock.calls.length).toBe(firstCallCount);
  });

  it('does nothing when no workspace maps to the Instagram account', async () => {
    (CompanyTable.findOne as jest.Mock).mockResolvedValue(null);
    await service.processIncomingComment(comment(), 'IG_BIZ_UNKNOWN');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('does not reply when the comment matches no active keyword', async () => {
    await service.processIncomingComment(comment({ text: 'nice photo' }), 'IG_BIZ_1');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('matches keywords on whole words only', async () => {
    // "PRICELESS" contains "PRICE" but is not the keyword.
    await service.processIncomingComment(comment({ text: 'this is priceless' }), 'IG_BIZ_1');
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('falls back to a public reply when the private reply is rejected', async () => {
    mockedAxios.post
      .mockRejectedValueOnce(new Error('private replies unavailable'))
      .mockResolvedValueOnce({ data: { id: 'public-reply' } } as any);

    await service.processIncomingComment(comment(), 'IG_BIZ_1');

    const calledUrls = mockedAxios.post.mock.calls.map(c => String(c[0]));
    expect(calledUrls.some(u => u.includes('/COMMENT_1/replies'))).toBe(true);
  });

  it('survives a comment event with no text', async () => {
    await expect(
      service.processIncomingComment(comment({ text: undefined }), 'IG_BIZ_1')
    ).resolves.toBeUndefined();
  });

  it('still processes the event when Redis is unavailable', async () => {
    redis.set.mockRejectedValue(new Error('redis down'));
    await service.processIncomingComment(comment(), 'IG_BIZ_1');
    expect(mockedAxios.post).toHaveBeenCalled();
  });
});

describe('InstagramService human agent messaging window', () => {
  let service: InstagramService;

  beforeEach(() => {
    service = buildService(fakeRedis());
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  const isOutside = (leadId: string) => (service as any).isOutsideStandardWindow(leadId);

  it('treats a conversation with no inbound message as inside the window', async () => {
    jest.spyOn(instagram_message, 'findOne').mockResolvedValue(null as any);
    // Nothing to extend, so the HUMAN_AGENT tag must not be attached.
    await expect(isOutside('lead-1')).resolves.toBe(false);
  });

  it('treats a reply 2 hours after the customer wrote as inside the window', async () => {
    jest.spyOn(instagram_message, 'findOne').mockResolvedValue({
      created_on: new Date(Date.now() - 2 * 60 * 60 * 1000)
    } as any);
    await expect(isOutside('lead-1')).resolves.toBe(false);
  });

  it('treats a reply 23 hours after the customer wrote as inside the window', async () => {
    jest.spyOn(instagram_message, 'findOne').mockResolvedValue({
      created_on: new Date(Date.now() - 23 * 60 * 60 * 1000)
    } as any);
    await expect(isOutside('lead-1')).resolves.toBe(false);
  });

  it('treats a reply 25 hours after the customer wrote as outside the window', async () => {
    jest.spyOn(instagram_message, 'findOne').mockResolvedValue({
      created_on: new Date(Date.now() - 25 * 60 * 60 * 1000)
    } as any);
    // Only here is HUMAN_AGENT both permitted and necessary.
    await expect(isOutside('lead-1')).resolves.toBe(true);
  });

  it('reads the window from the last INBOUND message, not the last message overall', async () => {
    const findOne = jest.spyOn(instagram_message, 'findOne').mockResolvedValue({
      created_on: new Date(Date.now() - 30 * 60 * 60 * 1000)
    } as any);
    await isOutside('lead-1');
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { lead_id: 'lead-1', direction: 'Inbound' } })
    );
  });
});
