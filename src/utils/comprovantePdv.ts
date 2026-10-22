import { Platform } from 'react-native';
import * as Print from 'expo-print';
import type { VendaPdv } from '../types/pdv';
import { formatarDataHora } from './dateFormat';

const FORMAS: Record<string, string> = { pix: 'PIX', credito: 'Crédito', debito: 'Débito', dinheiro: 'Dinheiro' };

function moeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function quantidade(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

function esc(texto: string | null | undefined): string {
  return (texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

export function labelFormaPagamento(forma: string): string {
  return FORMAS[forma] ?? forma;
}

/** Comprovante simples, sem valor fiscal, em HTML de bobina (80 mm). */
export function gerarHtmlComprovante(venda: VendaPdv): string {
  const linhas = venda.itens.map((i) => `
    <tr><td colspan="3" class="nome">${esc(i.nome)}</td></tr>
    <tr class="det"><td>${quantidade(i.quantidade)} ${esc(i.unidade)} × ${moeda(i.precoUnitario)}</td><td></td><td class="v">${moeda(i.subtotal)}</td></tr>`).join('');
  const dinheiro = venda.formaPagamento === 'dinheiro' && venda.valorRecebido != null
    ? `<tr><td>Recebido</td><td class="v">${moeda(venda.valorRecebido)}</td></tr>
       <tr><td>Troco</td><td class="v">${moeda(venda.troco ?? 0)}</td></tr>` : '';
  const cliente = venda.clienteNome || venda.clienteDocumento
    ? `<p>Cliente: ${esc(venda.clienteNome ?? '')} ${esc(venda.clienteDocumento ?? '')}</p>` : '';
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(venda.numero)}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; width: 72mm; margin: 0 auto; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 2px; }
  p { margin: 2px 0; }
  .c { text-align: center; }
  table { width: 100%; border-collapse: collapse; }
  .nome { padding-top: 4px; font-weight: bold; }
  .det td { font-size: 11px; }
  .v { text-align: right; white-space: nowrap; }
  hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  .total td { font-size: 14px; font-weight: bold; }
  .aviso { text-align: center; font-weight: bold; margin-top: 8px; }
</style></head><body>
  <h1>${esc(venda.empresaNome)}</h1>
  <p class="c">CNPJ/CPF ${esc(venda.empresaCnpj)}</p>
  <p class="c">${esc(venda.barracaNome)}</p>
  <hr>
  <p>Venda ${esc(venda.numero)}</p>
  <p>${esc(formatarDataHora(venda.criadoEm))}</p>
  <p>Operador: ${esc(venda.operadorNome)}</p>
  ${cliente}
  <hr>
  <table>${linhas}</table>
  <hr>
  <table>
    <tr class="total"><td>TOTAL</td><td class="v">${moeda(venda.total)}</td></tr>
    <tr><td>Pagamento</td><td class="v">${esc(labelFormaPagamento(venda.formaPagamento))}</td></tr>
    ${dinheiro}
  </table>
  <hr>
  <p class="aviso">COMPROVANTE SEM VALOR FISCAL</p>
  <p class="c">Stock4event · Compras e estoque para eventos</p>
</body></html>`;
}

/** Abre a impressão do sistema: nova janela no navegador, diálogo nativo no celular. */
export async function imprimirComprovante(venda: VendaPdv): Promise<void> {
  const html = gerarHtmlComprovante(venda);
  if (Platform.OS === 'web') {
    const janela = window.open('', '_blank', 'width=420,height=640');
    if (!janela) throw new Error('Permita pop-ups para imprimir o comprovante.');
    janela.document.open();
    janela.document.write(html);
    janela.document.close();
    janela.focus();
    janela.print();
    return;
  }
  await Print.printAsync({ html });
}
