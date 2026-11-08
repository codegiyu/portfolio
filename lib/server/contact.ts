import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function parseContactInput(input: unknown): ContactInput {
  return contactSchema.parse(input);
}

function safeHeader(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim();
}

export function composeContactMail(input: ContactInput) {
  const name = safeHeader(input.name);
  const email = safeHeader(input.email);
  const message = input.message.trim();

  return {
    subject: `Portfolio contact from ${name}`,
    text: [`Name: ${name}`, `Email: ${email}`, '', message].join('\n'),
    replyTo: email,
  };
}
