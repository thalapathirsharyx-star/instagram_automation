import { InstagramService } from './Instagram.service';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { instagram_lead } from '@Database/Table/CRM/instagram_lead';
import { instagram_message } from '@Database/Table/CRM/instagram_message';
import { knowledge_base } from '@Database/Table/CRM/knowledge_base';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function fakeRedis() {
  const store = new Map<string, string>();
  return {
    store,
    set: jest.fn(async (key: string, value: string, _ex?: any, _ttl?: any, mode?: string) => {
      if (mode === 'NX' && store.has(key)) return null;
      store.set(key, value);
      return 'OK';
    }),
    get: jest.fn(async (key: string) => store.get(key) ?? null),
    del: jest.fn(async (key: string) => { store.delete(key); return 1; })
  };
}

describe('InstagramService human-agent handoff', () => {
  let redis: ReturnType<typeof fakeRedis>;
  let service: InstagramService;
  let aiService: { generateAiReply: jest.Mock; analyzeStoryOcrText: jest.Mock };

  const COMPANY: any = {
    id: 'company-1',
    name: 'Acme',
    plan: 'Pro',
    monthly_ai_usage: 0,
    auto_reply_enabled: true,
    instagram_business_id: 'IG_BIZ_1',
    instagram_page_id: 'PAGE_1',
    instagram_access_token: 'page-token'
  };

  function makeLead(overrides: any = {}) {
    return {
      id: 'lead-1',
      company_id: 'company-1',
      instagram_handle: 'USER_1',
      customer_name: 'Shopper',
      lead_status: 'New',
      human_agent_active: false,
      assigned_agent_id: null,
      follow_up_sent: false,
      lead_score: 0,
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    redis = fakeRedis();
    aiService = {
      generateAiReply: jest.fn().mockResolvedValue({ reply: 'AI answer', confidence: '0.9' }),
      analyzeStoryOcrText: jest.fn()
    };

    service = new InstagramService(
      { emitNewMessage: jest.fn() } as any,
      aiService as any,
      {} as any,
      { SendMail: jest.fn() } as any,
      {} as any,
      {} as any,
      redis as any
    );

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    jest.spyOn(CompanyTable, 'findOne').mockResolvedValue({ ...COMPANY } as any);
    jest.spyOn(CompanyTable, 'update').mockResolvedValue({} as any);
    jest.spyOn(instagram_lead, 'count').mockResolvedValue(0 as any);
    jest.spyOn(knowledge_base, 'find').mockResolvedValue([] as any);
    jest.spyOn(instagram_message.prototype as any, 'save').mockResolvedValue(undefined);
    mockedAxios.post.mockResolvedValue({ data: {} } as any);
    mockedAxios.get.mockResolvedValue({ data: {} } as any);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('automation suppression', () => {
    it('does not generate an AI reply while a human agent owns the conversation', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(
        makeLead({ human_agent_active: true, assigned_agent_id: 'agent-9' }) as any
      );

      await service.processIncomingMessage('USER_1', 'what is the price?', 'MID_1', 'IG_BIZ_1');

      expect(aiService.generateAiReply).not.toHaveBeenCalled();
    });

    it('still records the inbound message during handoff so the agent can read it', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(
        makeLead({ human_agent_active: true }) as any
      );

      await service.processIncomingMessage('USER_1', 'hello?', 'MID_2', 'IG_BIZ_1');

      // The inbound message is persisted even though automation is suppressed.
      expect((instagram_message.prototype as any).save).toHaveBeenCalled();
    });

    it('does not generate an AI reply when the business disabled auto-reply', async () => {
      // auto_reply_enabled was settable in the UI but ignored by the engine.
      (CompanyTable.findOne as jest.Mock).mockResolvedValue({ ...COMPANY, auto_reply_enabled: false });
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);

      await service.processIncomingMessage('USER_1', 'what is the price?', 'MID_3', 'IG_BIZ_1');

      expect(aiService.generateAiReply).not.toHaveBeenCalled();
    });

    it('does generate an AI reply in the normal case', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);

      await service.processIncomingMessage('USER_1', 'what is the price?', 'MID_4', 'IG_BIZ_1');

      expect(aiService.generateAiReply).toHaveBeenCalledTimes(1);
    });
  });

  describe('message de-duplication', () => {
    it('ignores a redelivered message id', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);

      await service.processIncomingMessage('USER_1', 'first', 'MID_DUP', 'IG_BIZ_1');
      expect(aiService.generateAiReply).toHaveBeenCalledTimes(1);

      await service.processIncomingMessage('USER_1', 'first', 'MID_DUP', 'IG_BIZ_1');
      expect(aiService.generateAiReply).toHaveBeenCalledTimes(1);
    });

    it('survives a Redis outage by falling back to the in-memory set', async () => {
      redis.set.mockRejectedValue(new Error('redis down'));
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);

      await service.processIncomingMessage('USER_1', 'x', 'MID_FALLBACK', 'IG_BIZ_1');
      await service.processIncomingMessage('USER_1', 'x', 'MID_FALLBACK', 'IG_BIZ_1');

      expect(aiService.generateAiReply).toHaveBeenCalledTimes(1);
    });

    it('de-duplicates across instances via Redis, not process memory', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);
      await service.processIncomingMessage('USER_1', 'x', 'MID_SHARED', 'IG_BIZ_1');

      // A second process sharing the same Redis must also treat it as seen.
      const second = new InstagramService(
        { emitNewMessage: jest.fn() } as any,
        aiService as any, {} as any, { SendMail: jest.fn() } as any,
        {} as any, {} as any, redis as any
      );
      await second.processIncomingMessage('USER_1', 'x', 'MID_SHARED', 'IG_BIZ_1');

      expect(aiService.generateAiReply).toHaveBeenCalledTimes(1);
    });
  });

  describe('claim and release', () => {
    it('claims a conversation for the acting agent and suppresses automation', async () => {
      const lead = makeLead();
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(lead as any);
      jest.spyOn(instagram_message, 'findOne').mockResolvedValue(null as any);

      const res = await service.claimConversation('company-1', 'lead-1', 'agent-9');

      expect(lead.human_agent_active).toBe(true);
      expect(lead.assigned_agent_id).toBe('agent-9');
      expect(lead.lead_status).toBe('Handoff');
      expect(res.Data.assigned_agent_id).toBe('agent-9');
    });

    it('reports whether the 24h window has closed when claiming', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(makeLead() as any);
      jest.spyOn(instagram_message, 'findOne').mockResolvedValue({
        created_on: new Date(Date.now() - 30 * 60 * 60 * 1000)
      } as any);

      const res = await service.claimConversation('company-1', 'lead-1', 'agent-9');
      expect(res.Data.outside_standard_window).toBe(true);
    });

    it('releases a conversation back to automation', async () => {
      const lead = makeLead({ human_agent_active: true, assigned_agent_id: 'agent-9' });
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(lead as any);

      await service.releaseConversation('company-1', 'lead-1');

      expect(lead.human_agent_active).toBe(false);
      expect(lead.assigned_agent_id).toBeNull();
    });

    it('scopes the claim to the agent own workspace', async () => {
      // A lead belonging to another tenant must not be resolvable.
      const findOne = jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(null as any);

      await expect(service.claimConversation('company-OTHER', 'lead-1', 'agent-9'))
        .rejects.toThrow('Conversation not found');

      expect(findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'lead-1', company_id: 'company-OTHER' } })
      );
    });

    it('scopes the release to the agent own workspace', async () => {
      jest.spyOn(instagram_lead, 'findOne').mockResolvedValue(null as any);
      await expect(service.releaseConversation('company-OTHER', 'lead-1'))
        .rejects.toThrow('Conversation not found');
    });
  });

  describe('connection health', () => {
    it('flags a workspace as needing reconnection and surfaces it in settings', async () => {
      jest.spyOn(CompanyTable, 'findOneBy').mockResolvedValue({ ...COMPANY } as any);

      await service.markConnectionRevoked('company-1', 'Access was revoked.');
      const settings = await service.getIntegrationSettings('company-1');

      expect(settings.Data.needs_reconnect).toBe(true);
      expect(settings.Data.connection_detail).toBe('Access was revoked.');
    });

    it('reports a healthy connection when nothing is flagged', async () => {
      jest.spyOn(CompanyTable, 'findOneBy').mockResolvedValue({ ...COMPANY } as any);

      const settings = await service.getIntegrationSettings('company-1');

      expect(settings.Data.needs_reconnect).toBe(false);
      expect(settings.Data.connection_detail).toBeNull();
    });
  });
});
