const CONTROL_OR_CSS_CHARACTERS = /[\u0000-\u001f\u007f"'`()\\]/;

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      !url.username &&
      !url.password &&
      !CONTROL_OR_CSS_CHARACTERS.test(value)
    );
  } catch {
    return false;
  }
}

export function isSafeLocalAsset(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !CONTROL_OR_CSS_CHARACTERS.test(value);
}

export function isSafeAssetUrl(value: string): boolean {
  return value === '' || isSafeLocalAsset(value) || isSafeHttpUrl(value);
}

export function escapeCssUrl(value: string): string {
  return value.replace(/[\\"()]/g, character => `\\${character}`);
}
