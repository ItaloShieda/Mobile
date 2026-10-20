import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredSession } from '../types/auth';

export type { StoredSession };

const SESSION_KEY = '@stock4event_session';

export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

export async function saveSession(session: StoredSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
