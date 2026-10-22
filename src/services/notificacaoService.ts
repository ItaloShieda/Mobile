import { apiFetch, parseResponse } from './http';
import type { TipoNotificacao, Notificacao } from '../types/notificacao';

export type { TipoNotificacao, Notificacao };

export async function listarNotificacoes(empresaCompradoraId: number): Promise<Notificacao[]> {
  const response = await apiFetch(`/api/notificacoes?empresaCompradoraId=${empresaCompradoraId}`,
  );
  return parseResponse<Notificacao[]>(response, 'Não foi possível carregar notificações.');
}

export function labelTipoNotificacao(tipo: TipoNotificacao): string {
  if (tipo === 'compra') return 'Compra';
  if (tipo === 'promocao') return 'Promoção';
  if (tipo === 'sistema') return 'Sistema';
  return 'Oferta';
}

export function iconeTipoNotificacao(tipo: TipoNotificacao): string {
  if (tipo === 'compra') return 'bag-check-outline';
  if (tipo === 'promocao') return 'pricetag-outline';
  if (tipo === 'sistema') return 'sparkles-outline';
  return 'flash-outline';
}
