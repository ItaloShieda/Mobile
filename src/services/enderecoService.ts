import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import { normalizarCep } from '../utils/cepUtils';
import { extractErrorMessage, parseResponse } from './http';
import type {
  EnderecoEntrega,
  EnderecoEntregaPayload,
  DadosCep,
} from '../types/endereco';

export type { EnderecoEntrega, EnderecoEntregaPayload, DadosCep };

const ENDERECO_STORAGE_KEY = 'sacola:enderecoId';

export async function listarEnderecos(empresaId: number): Promise<EnderecoEntrega[]> {
  const response = await fetch(`${API_BASE_URL}/api/enderecos?empresaId=${empresaId}`);
  return parseResponse<EnderecoEntrega[]>(
    response,
    'Não foi possível carregar endereços.',
    { treatOutdatedServer: true },
  );
}

export async function consultarCep(cep: string): Promise<DadosCep | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/enderecos/cep/${digits}`);
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o backend está rodando.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Não foi possível consultar o CEP.', { treatOutdatedServer: true }),
    );
  }

  return data as DadosCep;
}

export async function criarEndereco(payload: EnderecoEntregaPayload): Promise<EnderecoEntrega> {
  const body = {
    ...payload,
    cep: normalizarCep(payload.cep),
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/enderecos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique se o backend está rodando.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Não foi possível salvar o endereço.', { treatOutdatedServer: true }),
    );
  }

  return data as EnderecoEntrega;
}

export async function atualizarEndereco(
  id: number,
  payload: EnderecoEntregaPayload,
): Promise<EnderecoEntrega> {
  const response = await fetch(`${API_BASE_URL}/api/enderecos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, cep: normalizarCep(payload.cep) }),
  });
  return parseResponse<EnderecoEntrega>(
    response,
    'Não foi possível atualizar o endereço.',
    { treatOutdatedServer: true },
  );
}

export async function definirEnderecoPrincipal(
  id: number,
  empresaId: number,
): Promise<EnderecoEntrega> {
  const response = await fetch(
    `${API_BASE_URL}/api/enderecos/${id}/principal?empresaId=${empresaId}`,
    { method: 'PATCH' },
  );
  return parseResponse<EnderecoEntrega>(
    response,
    'Não foi possível definir o endereço principal.',
    { treatOutdatedServer: true },
  );
}

export async function removerEndereco(id: number, empresaId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/enderecos/${id}?empresaId=${empresaId}`, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      extractErrorMessage(data, 'Não foi possível remover o endereço.', { treatOutdatedServer: true }),
    );
  }
}

export async function salvarEnderecoSelecionado(enderecoId: number): Promise<void> {
  await AsyncStorage.setItem(ENDERECO_STORAGE_KEY, String(enderecoId));
}

export async function obterEnderecoSelecionado(): Promise<number | null> {
  const value = await AsyncStorage.getItem(ENDERECO_STORAGE_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolverEnderecoInicial(
  enderecos: EnderecoEntrega[],
  enderecoSalvoId: number | null,
): EnderecoEntrega | null {
  if (enderecos.length === 0) return null;
  if (enderecoSalvoId != null) {
    const salvo = enderecos.find((e) => e.id === enderecoSalvoId);
    if (salvo) return salvo;
  }
  return enderecos.find((e) => e.principal) ?? enderecos[0];
}
