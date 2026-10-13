export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const imageUrl = (path: string) => `${API_URL.replace(/\/$/, '')}${path}`;

export async function apiRequest<T>(path: string, method = 'GET', body?: unknown, timeoutMs = 60000): Promise<T> {
  
  const response = await fetch(`${API_URL.replace(/\/$/, '')}/scrapper/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.message ?? 'Request failed.');
  return data as T;
}
