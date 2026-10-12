import 'server-only';

type SafeValue = string | number | boolean;

export function logServerError(code: string, context: Record<string, SafeValue | undefined> = {}) {
  const safeContext = Object.fromEntries(
    Object.entries(context).filter((entry): entry is [string, SafeValue] => entry[1] !== undefined)
  );
  console.error(JSON.stringify({ code, ...safeContext }));
}
