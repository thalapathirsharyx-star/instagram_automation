import { InstagramService } from './Instagram.service';
import { company as CompanyTable } from '@Database/Table/Admin/company';
import { comment_trigger } from '@Database/Table/CRM/comment_trigger';
import { commentContainsKeyword, matchCommentTrigger, parseTriggerKeywords } from './CommentTrigger.matcher';

describe('comment trigger keyword matching', () => {
  it('splits, trims, uppercases and de-duplicates keywords', () => {
    expect(parseTriggerKeywords(' price, Link ,,PRICE ')).toEqual(['PRICE', 'LINK']);
    expect(parseTriggerKeywords(undefined)).toEqual([]);
  });

  it('matches whole words only', () => {
    expect(commentContainsKeyword('WHAT IS THE PRICE?', 'PRICE')).toBe(true);
    expect(commentContainsKeyword('PRICELESS', 'PRICE')).toBe(false);
  });

  it('treats regex characters in a keyword literally instead of throwing', () => {
    expect(() => commentContainsKeyword('I LOVE C++', 'C++')).not.toThrow();
    expect(commentContainsKeyword('I LOVE C++', 'C++')).toBe(true);
    expect(commentContainsKeyword('A ( B', '(')).toBe(true);
    expect(commentContainsKeyword('ANYTHING', '.*')).toBe(false);
  });

  it('matches non-Latin keywords and emoji', () => {
    expect(commentContainsKeyword('விலை என்ன?', 'விலை')).toBe(true);
    expect(commentContainsKeyword('कीमत बताओ', 'कीमत')).toBe(true);
    expect(commentContainsKeyword('WANT THIS 🔥', '🔥')).toBe(true);
    // A Tamil word containing the keyword plus a vowel sign is a different word.
    expect(commentContainsKeyword('விலைகள்', 'விலை')).toBe(false);
  });

  it('prefers the trigger for the commented post over an all-posts trigger', () => {
    const triggers = [
      { id: 'all', keyword: 'PRICE', media_id: null },
      { id: 'reel', keyword: 'PRICE', media_id: '123' },
      { id: 'other', keyword: 'LINK', media_id: '999' }
    ];
    expect(matchCommentTrigger(triggers, 'price?', '123')?.id).toBe('reel');
    expect(matchCommentTrigger(triggers, 'price?', '456')?.id).toBe('all');
    expect(matchCommentTrigger(triggers, 'link', '456')).toBeUndefined();
    expect(matchCommentTrigger(triggers, '', '123')).toBeUndefined();
  });
});

describe('InstagramService comment trigger validation', () => {
  let service: InstagramService;
  const saveSpy = jest.fn();

  beforeEach(() => {
    service = new InstagramService({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, {} as any);
    jest.spyOn(comment_trigger, 'find').mockResolvedValue([]);
    jest.spyOn(CompanyTable, 'findOne').mockResolvedValue({ id: 'c1', plan: 'Free' } as any);
    jest.spyOn(comment_trigger.prototype as any, 'save').mockImplementation(saveSpy);
    saveSpy.mockReset();
  });

  afterEach(() => jest.restoreAllMocks());

  const create = (data: any) => service.createCommentTrigger('c1', data);

  it('rejects a missing keyword or message with a 400, not a 500', async () => {
    await expect(create({ replyMessage: 'hi' })).rejects.toMatchObject({ status: 400 });
    await expect(create({ keyword: 'PRICE' })).rejects.toMatchObject({ status: 400 });
    await expect(create({ keyword: ' , ', replyMessage: 'hi' })).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a message longer than Instagram allows', async () => {
    await expect(create({ keyword: 'PRICE', replyMessage: 'x'.repeat(1001) })).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a keyword already used on an overlapping post', async () => {
    (comment_trigger.find as jest.Mock).mockResolvedValue([{ id: 't1', keyword: 'PRICE, LINK', media_id: null }]);
    await expect(create({ keyword: 'link', replyMessage: 'hi' })).rejects.toMatchObject({ status: 409 });
  });

  it('allows the same keyword on two different posts', async () => {
    (comment_trigger.find as jest.Mock).mockResolvedValue([{ id: 't1', keyword: 'PRICE', media_id: '111' }]);
    const res = await create({ keyword: 'price', replyMessage: 'hi', mediaId: '222', postTitle: 'Summer reel' });
    expect(res.Data.media_id).toBe('222');
    expect(res.Data.post_title).toBe('Summer reel');
  });

  it('enforces the plan automation limit', async () => {
    (comment_trigger.find as jest.Mock).mockResolvedValue(
      [1, 2, 3, 4].map(i => ({ id: `t${i}`, keyword: `K${i}`, media_id: null }))
    );
    await expect(create({ keyword: 'NEW', replyMessage: 'hi' })).rejects.toMatchObject({ status: 403 });
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('normalises the stored trigger', async () => {
    const res = await create({ keyword: ' price ,link', replyMessage: '  Here you go  ', postTitle: 'ignored' });
    expect(res.Data).toMatchObject({ keyword: 'PRICE, LINK', reply_message: 'Here you go', media_id: null, post_title: 'All Posts & Reels' });
  });

  it('returns 404 for a trigger in another workspace', async () => {
    jest.spyOn(comment_trigger, 'findOne').mockResolvedValue(null as any);
    await expect(service.toggleCommentTrigger('c1', 'nope')).rejects.toMatchObject({ status: 404 });
    await expect(service.deleteCommentTrigger('c1', 'nope')).rejects.toMatchObject({ status: 404 });
    await expect(service.updateCommentTrigger('c1', 'nope', {})).rejects.toMatchObject({ status: 404 });
  });
});
