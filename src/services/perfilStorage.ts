import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PerfilCadastro } from '../types/auth';

const PERFIL_KEY = '@stock4event_perfil_uso';

function storageKey(email: string) {
  return `${PERFIL_KEY}:${email.trim().toLowerCase()}`;
}

export async function savePerfilUso(email: string, perfil: PerfilCadastro): Promise<void> {
  await AsyncStorage.setItem(storageKey(email), perfil);
}

const MODO_KEY = '@stock4event_modo_ativo';

export type ModoAtivo = 'Cliente' | 'Fornecedor';

/** Visão escolhida por contas "Cliente e fornecedor". */
export async function saveModoAtivo(email: string, modo: ModoAtivo): Promise<void> {
  await AsyncStorage.setItem(`${MODO_KEY}:${email.trim().toLowerCase()}`, modo);
}

export async function loadModoAtivo(email: string): Promise<ModoAtivo | null> {
  const value = await AsyncStorage.getItem(`${MODO_KEY}:${email.trim().toLowerCase()}`);
  return value === 'Cliente' || value === 'Fornecedor' ? value : null;
}

export async function loadPerfilUso(email: string): Promise<PerfilCadastro | null> {
  const value = await AsyncStorage.getItem(storageKey(email));
  if (value === 'Cliente' || value === 'Fornecedor' || value === 'ClienteFornecedor') {
    return value;
  }
  return null;
}
