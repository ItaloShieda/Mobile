/** Conta de testes e manutenção do administrador do projeto (criada pelo DemoSeedRunner do backend). */
export const DEMO_EMAIL = 'demo@quickstock.com';

export function isContaDemo(email?: string | null): boolean {
  return (email ?? '').trim().toLowerCase() === DEMO_EMAIL;
}
