import { apiFetch, NETWORK_ERROR_MESSAGE, parseResponse } from './http';

export type StatusCaminhoneiro = 'Em rota' | 'Carregando' | 'Disponível' | 'Atrasado';
export type StatusEntrega = 'Em rota' | 'Carregando' | 'Entregue';

export interface EntregaLogistica {
  id: number;
  nomeCliente: string;
  cidade: string;
  rota: string;
  status: StatusEntrega;
}

export interface Caminhoneiro {
  id: number;
  nome: string;
  veiculo: string;
  rota: string;
  status: StatusCaminhoneiro | string;
  entregas: EntregaLogistica[];
  clientes: string[];
}

export interface EtapaLogistica {
  nome: string;
  concluido: boolean;
  horario: string;
}

export interface LogisticaResumo {
  vazio: boolean;
  status: string | null;
  tempoEstimado: string | null;
  pedido: string | null;
  motorista: string | null;
  rota: string | null;
  etapas: EtapaLogistica[];
}

export interface NovaEntregaPayload {
  nomeCliente: string;
  cidade?: string;
}

export interface NovoCaminhoneiroPayload {
  empresaId: number;
  nome: string;
  veiculo: string;
  rota: string;
  entrega?: NovaEntregaPayload;
}

export async function listarCaminhoneiros(empresaId: number): Promise<Caminhoneiro[]> {
  const response = await apiFetch(`/api/caminhoneiros?empresaId=${empresaId}`);
  const lista = await parseResponse<Caminhoneiro[]>(response, 'Não foi possível carregar os caminhoneiros.');
  return lista.map((item) => ({
    ...item,
    entregas: item.entregas ?? [],
    clientes: item.clientes ?? [],
  }));
}

export async function criarCaminhoneiro(payload: NovoCaminhoneiroPayload): Promise<Caminhoneiro> {
  let response: Response;
  try {
    response = await apiFetch(`/api/caminhoneiros`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  const criado = await parseResponse<Caminhoneiro>(response, 'Não foi possível salvar o caminhoneiro.');
  return {
    ...criado,
    entregas: criado.entregas ?? [],
    clientes: criado.clientes ?? [],
  };
}

export async function obterLogistica(empresaId: number): Promise<LogisticaResumo> {
  const response = await apiFetch(`/api/logistica?empresaId=${empresaId}`);
  const resumo = await parseResponse<LogisticaResumo>(response, 'Não foi possível carregar a logística.');
  return {
    ...resumo,
    etapas: resumo.etapas ?? [],
    vazio: Boolean(resumo.vazio),
  };
}
