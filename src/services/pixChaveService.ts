import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { extractErrorMessage, parseResponse } from './http';
import {
  TipoChavePix,
  mascararChavePix,
  extrairUltimosDigitosPix,
  normalizarDocumento,
} from '../utils/pixUtils';
import type { PixSalvo, PixSalvoPayload } from '../types/pagamento';

export type { TipoChavePix, PixSalvo, PixSalvoPayload };

// Versões antigas do app guardavam as chaves só no aparelho.
const LEGACY_STORAGE_KEY_PREFIX = '@quickstock_pix_chaves';

function legacyStorageKey(empresaId: number): string {
  return `${LEGACY_STORAGE_KEY_PREFIX}_${empresaId}`;
}

async function migrarChavesLocais(empresaId: number): Promise<void> {
  const raw = await AsyncStorage.getItem(legacyStorageKey(empresaId));
  if (!raw) return;

  let locais: PixSalvoPayload[] = [];
  try {
    const parsed = JSON.parse(raw);
    locais = Array.isArray(parsed) ? parsed : [];
  } catch {
    locais = [];
  }

  // A lista local está do mais novo para o mais antigo; envia na ordem de criação.
  for (const chave of [...locais].reverse()) {
    await salvarChavePix({
      empresaId,
      apelido: chave.apelido,
      tipoChave: chave.tipoChave,
      chaveMascarada: chave.chaveMascarada,
      ultimosDigitos: chave.ultimosDigitos,
    });
  }
  await AsyncStorage.removeItem(legacyStorageKey(empresaId));
}

export async function listarChavesPix(empresaId: number): Promise<PixSalvo[]> {
  await migrarChavesLocais(empresaId);
  const response = await fetch(`${API_BASE_URL}/api/chaves-pix?empresaId=${empresaId}`);
  return parseResponse<PixSalvo[]>(
    response,
    'Não foi possível carregar as chaves PIX.',
    { treatOutdatedServer: true },
  );
}

export async function salvarChavePix(payload: PixSalvoPayload): Promise<PixSalvo> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/chaves-pix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o backend está rodando.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Não foi possível salvar a chave PIX.', { treatOutdatedServer: true }),
    );
  }

  return data as PixSalvo;
}

export async function removerChavePix(empresaId: number, chaveId: number): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/chaves-pix/${chaveId}?empresaId=${empresaId}`,
    { method: 'DELETE' },
  );

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(data, 'Não foi possível remover a chave PIX.', { treatOutdatedServer: true }),
    );
  }
}

export async function garantirChaveCnpjInicial(
  empresaId: number,
  cnpjEmpresa?: string,
): Promise<PixSalvo[]> {
  const chaves = await listarChavesPix(empresaId);
  if (chaves.length > 0) return chaves;

  const cnpj = normalizarDocumento(cnpjEmpresa ?? '');
  if (cnpj.length !== 14) return chaves;

  await salvarChavePix({
    empresaId,
    apelido: 'CNPJ da empresa',
    tipoChave: 'cnpj',
    chaveMascarada: mascararChavePix('cnpj', cnpj),
    ultimosDigitos: extrairUltimosDigitosPix('cnpj', cnpj),
  });

  return listarChavesPix(empresaId);
}
