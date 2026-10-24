import * as crypto from 'crypto';
import { HttpException } from '@nestjs/common';
import { InstagramController } from './Instagram.controller';

const APP_SECRET = 'test-app-secret';
const VERIFY_TOKEN = 'test-verify-token';

/**
 * Builds a request shaped like the one Meta sends, with a valid X-Hub-Signature-256
 * over the exact raw body.
 */
function signedRequest(body: any, secret = APP_SECRET) {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`;
  return { headers: { 'x-hub-signature-256': signature }, rawBody };
}

function messagingEvent(igBusinessId = 'IG_BIZ_1') {
  return {
    object: 'instagram',
    entry: [
      {
        id: igBusinessId,
        messaging: [
          { sender: { id: 'USER_1' }, message: { mid: 'MID_1', text: 'hello' } }
        ]
      }
    ]
  };
}

function commentEvent(igBusinessId = 'IG_BIZ_1', commentId = 'COMMENT_1') {
  return {
    object: 'instagram',
    entry: [
      {
        id: igBusinessId,
        changes: [
          {
            field: 'comments',
            value: {
              id: commentId,
              text: 'PRICE please',
              from: { id: 'USER_1', username: 'someone' },
              media: { id: 'MEDIA_1' }
            }
          }
        ]
      }
    ]
  };
}

describe('InstagramController webhooks', () => {
  let controller: InstagramController;
  let service: {
    processIncomingMessage: jest.Mock;
    processIncomingComment: jest.Mock;
    handleMetaDataDeletion: jest.Mock;
    handleMetaDeauthorization: jest.Mock;
  };
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.FB_APP_SECRET = APP_SECRET;
    process.env.IG_CRM_VERIFY_TOKEN = VERIFY_TOKEN;
    process.env.NODE_ENV = 'test';
    delete process.env.BYPASS_SIGNATURE;

    service = {
      processIncomingMessage: jest.fn().mockResolvedValue(undefined),
      processIncomingComment: jest.fn().mockResolvedValue(undefined),
      handleMetaDataDeletion: jest.fn().mockResolvedValue({ confirmation_code: 'DEL-ABC', workspaces: 1 }),
      handleMetaDeauthorization: jest.fn().mockResolvedValue({ workspaces: 1 })
    };
    controller = new InstagramController(service as any);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  describe('verification challenge', () => {
    it('echoes the challenge when mode and token are correct', async () => {
      await expect(controller.VerifyWebhook('subscribe', VERIFY_TOKEN, '1158201444')).resolves.toBe('1158201444');
    });

    it('rejects a wrong verify token', async () => {
      await expect(controller.VerifyWebhook('subscribe', 'wrong-token', '123')).rejects.toBeInstanceOf(HttpException);
    });

    it('rejects a mode other than subscribe', async () => {
      await expect(controller.VerifyWebhook('unsubscribe', VERIFY_TOKEN, '123')).rejects.toBeInstanceOf(HttpException);
    });

    it('refuses verification when no verify token is configured', async () => {
      delete process.env.IG_CRM_VERIFY_TOKEN;
      await expect(controller.VerifyWebhook('subscribe', VERIFY_TOKEN, '123')).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('signature validation', () => {
    it('accepts a correctly signed event and acknowledges immediately', async () => {
      const body = messagingEvent();
      const req = signedRequest(body);
      await expect(controller.HandleWebhook(body, req)).resolves.toEqual({ status: 'EVENT_RECEIVED' });
    });

    it('rejects an event signed with the wrong secret', async () => {
      const body = messagingEvent();
      const req = signedRequest(body, 'attacker-secret');
      await expect(controller.HandleWebhook(body, req)).rejects.toBeInstanceOf(HttpException);
      expect(service.processIncomingMessage).not.toHaveBeenCalled();
    });

    it('rejects an event with no signature header', async () => {
      const body = messagingEvent();
      await expect(
        controller.HandleWebhook(body, { headers: {}, rawBody: Buffer.from(JSON.stringify(body)) })
      ).rejects.toBeInstanceOf(HttpException);
    });

    it('rejects a tampered body whose signature no longer matches', async () => {
      const body = messagingEvent();
      const req = signedRequest(body);
      req.rawBody = Buffer.from(JSON.stringify(messagingEvent('IG_BIZ_ATTACKER')));
      await expect(controller.HandleWebhook(body, req)).rejects.toBeInstanceOf(HttpException);
    });

    it('does not honour BYPASS_SIGNATURE in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.BYPASS_SIGNATURE = 'true';
      const body = messagingEvent();
      const req = signedRequest(body, 'attacker-secret');
      await expect(controller.HandleWebhook(body, req)).rejects.toBeInstanceOf(HttpException);
    });

    it('refuses all events when FB_APP_SECRET is unset', async () => {
      delete process.env.FB_APP_SECRET;
      const body = messagingEvent();
      await expect(
        controller.HandleWebhook(body, { headers: { 'x-hub-signature-256': 'sha256=x' }, rawBody: Buffer.from('{}') })
      ).rejects.toBeInstanceOf(HttpException);
    });
  });

  describe('event routing', () => {
    it('routes a messaging event to the message handler with the entry id as the account id', async () => {
      const body = messagingEvent('IG_BIZ_42');
      await controller.HandleWebhook(body, signedRequest(body));
      expect(service.processIncomingMessage).toHaveBeenCalledWith(
        'USER_1', 'hello', 'MID_1', 'IG_BIZ_42', false, undefined
      );
    });

    it('routes a comments change event to the comment handler', async () => {
      const body = commentEvent('IG_BIZ_42', 'COMMENT_9');
      await controller.HandleWebhook(body, signedRequest(body));
      expect(service.processIncomingComment).toHaveBeenCalledTimes(1);
      const [value, igId] = service.processIncomingComment.mock.calls[0];
      expect(value.id).toBe('COMMENT_9');
      expect(igId).toBe('IG_BIZ_42');
    });

    it('ignores echo events so the app never replies to its own message', async () => {
      const body = {
        object: 'instagram',
        entry: [{ id: 'IG_BIZ_1', messaging: [{ sender: { id: 'IG_BIZ_1' }, message: { mid: 'M', text: 'hi', is_echo: true } }] }]
      };
      await controller.HandleWebhook(body, signedRequest(body));
      expect(service.processIncomingMessage).not.toHaveBeenCalled();
    });

    it('ignores an unsupported webhook object', async () => {
      const body = { object: 'page', entry: [{ id: 'P', changes: [{ field: 'feed', value: {} }] }] };
      await expect(controller.HandleWebhook(body, signedRequest(body))).resolves.toEqual({ status: 'EVENT_RECEIVED' });
      expect(service.processIncomingMessage).not.toHaveBeenCalled();
      expect(service.processIncomingComment).not.toHaveBeenCalled();
    });

    it('ignores an unsupported change field', async () => {
      const body = {
        object: 'instagram',
        entry: [{ id: 'IG_BIZ_1', changes: [{ field: 'story_insights', value: { impressions: 1 } }] }]
      };
      await controller.HandleWebhook(body, signedRequest(body));
      expect(service.processIncomingComment).not.toHaveBeenCalled();
    });

    it('still acknowledges when a handler throws, so Meta does not retry forever', async () => {
      service.processIncomingComment.mockRejectedValue(new Error('transient Meta API failure'));
      const body = commentEvent();
      await expect(controller.HandleWebhook(body, signedRequest(body))).resolves.toEqual({ status: 'EVENT_RECEIVED' });
    });

    it('does not log message text, which is customer content', async () => {
      const body = messagingEvent();
      await controller.HandleWebhook(body, signedRequest(body));
      const logged = (console.log as jest.Mock).mock.calls.flat().join(' ');
      expect(logged).not.toContain('hello');
    });
  });

  describe('signed_request callbacks', () => {
    function signedRequestPayload(payload: any, secret = APP_SECRET) {
      const encodedPayload = Buffer.from(JSON.stringify(payload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      const sig = crypto
        .createHmac('sha256', secret)
        .update(encodedPayload)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      return `${sig}.${encodedPayload}`;
    }

    it('deletes data for the user named in a valid signed_request', async () => {
      const res = await controller.DataDeletion({
        signed_request: signedRequestPayload({ user_id: 'FB_USER_1', algorithm: 'HMAC-SHA256' })
      });
      expect(service.handleMetaDataDeletion).toHaveBeenCalledWith('FB_USER_1');
      expect(res.confirmation_code).toBe('DEL-ABC');
      expect(res.url).toContain('/data-deletion');
    });

    it('rejects a data deletion request signed with the wrong secret', async () => {
      await expect(
        controller.DataDeletion({ signed_request: signedRequestPayload({ user_id: 'FB_USER_1' }, 'attacker') })
      ).rejects.toBeInstanceOf(HttpException);
      expect(service.handleMetaDataDeletion).not.toHaveBeenCalled();
    });

    it('rejects a data deletion request with no signed_request', async () => {
      await expect(controller.DataDeletion({})).rejects.toBeInstanceOf(HttpException);
      expect(service.handleMetaDataDeletion).not.toHaveBeenCalled();
    });

    it('clears credentials on a valid deauthorization', async () => {
      await controller.Deauthorize({ signed_request: signedRequestPayload({ user_id: 'FB_USER_2' }) });
      expect(service.handleMetaDeauthorization).toHaveBeenCalledWith('FB_USER_2');
    });

    it('rejects a forged deauthorization', async () => {
      await expect(
        controller.Deauthorize({ signed_request: signedRequestPayload({ user_id: 'FB_USER_2' }, 'attacker') })
      ).rejects.toBeInstanceOf(HttpException);
      expect(service.handleMetaDeauthorization).not.toHaveBeenCalled();
    });
  });
});
