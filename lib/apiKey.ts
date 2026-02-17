const API_KEY_STORAGE_KEY = 'careerpal_gemini_api_key_v1';

export function getGeminiApiKey(): string {
  // Prefer user-provided key (works on GitHub Pages without exposing secrets).
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(API_KEY_STORAGE_KEY) : null;
  if (stored && stored.trim()) return stored.trim();

  // Optional: allow local dev via Vite env var (NOT available on GitHub Pages at runtime).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viteKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (viteKey && viteKey.trim()) return viteKey.trim();

  return '';
}

export function setGeminiApiKey(key: string) {
  const k = key.trim();
  window.localStorage.setItem(API_KEY_STORAGE_KEY, k);
}

export function clearGeminiApiKey() {
  window.localStorage.removeItem(API_KEY_STORAGE_KEY);
}

export function hasGeminiApiKey(): boolean {
  return Boolean(getGeminiApiKey());
}

