import { describe, expect, it } from 'vitest';
import { composeContactMail, contactSchema } from '@/lib/server/contact';

describe('contact contract', () => {
  it('accepts bounded contact input and composes plain text mail', () => {
    const input = contactSchema.parse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'I would like to discuss a project.',
    });
    expect(composeContactMail(input)).toEqual({
      subject: 'Portfolio contact from Ada Lovelace',
      text: 'Name: Ada Lovelace\nEmail: ada@example.com\n\nI would like to discuss a project.',
      replyTo: 'ada@example.com',
    });
  });

  it('rejects oversized or malformed input', () => {
    expect(() => contactSchema.parse({ name: 'A', email: 'bad', message: 'short' })).toThrow();
    expect(() =>
      contactSchema.parse({ name: 'Valid Name', email: 'a@example.com', message: 'x'.repeat(5001) })
    ).toThrow();
  });

  it('removes header newlines from the subject and reply address', () => {
    const input = contactSchema.parse({
      name: 'Name\nInjected',
      email: 'person@example.com',
      message: 'A valid message body.',
    });
    const mail = composeContactMail(input);
    expect(mail.subject).not.toContain('\n');
    expect(mail.replyTo).not.toContain('\n');
  });
});
