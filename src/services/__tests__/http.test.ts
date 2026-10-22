import { apiFetch, setAuthToken, setUnauthorizedHandler } from '../http';
import { API_BASE_URL } from '../../config/api';

function resposta(status: number): Response {
  return { status, ok: status < 400, json: async () => ({}) } as unknown as Response;
}

describe('apiFetch', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
    setAuthToken(null);
    setUnauthorizedHandler(null);
  });

  function headerEnviado(): string | null {
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    return new Headers(init.headers).get('Authorization');
  }

  it('envia o token da sessão no header Authorization', async () => {
    fetchMock.mockResolvedValue(resposta(200));
    setAuthToken('abc.def.ghi');
    await apiFetch('/api/produtos');
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_BASE_URL}/api/produtos`);
    expect(headerEnviado()).toBe('Bearer abc.def.ghi');
  });

  it('não envia Authorization sem sessão (login, cadastro)', async () => {
    fetchMock.mockResolvedValue(resposta(200));
    await apiFetch('/api/usuarios/login', { method: 'POST' });
    expect(headerEnviado()).toBeNull();
  });

  it('preserva um Authorization explícito e os demais headers', async () => {
    fetchMock.mockResolvedValue(resposta(200));
    setAuthToken('sessao');
    await apiFetch('/api/usuarios/me', { headers: { Authorization: 'Bearer outro', 'Content-Type': 'application/json' } });
    const headers = new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer outro');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('avisa o app (logout) quando o servidor recusa o token com 401', async () => {
    fetchMock.mockResolvedValue(resposta(401));
    const sair = jest.fn();
    setUnauthorizedHandler(sair);
    setAuthToken('expirado');
    await apiFetch('/api/enderecos');
    expect(sair).toHaveBeenCalledTimes(1);
  });

  it('não desloga em 401 sem sessão (senha errada no login) nem em 403', async () => {
    const sair = jest.fn();
    setUnauthorizedHandler(sair);
    fetchMock.mockResolvedValue(resposta(401));
    await apiFetch('/api/usuarios/login', { method: 'POST' });
    setAuthToken('valido');
    fetchMock.mockResolvedValue(resposta(403));
    await apiFetch('/api/enderecos?empresaId=999');
    expect(sair).not.toHaveBeenCalled();
  });
});
