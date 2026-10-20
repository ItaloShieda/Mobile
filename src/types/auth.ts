export type PerfilCadastro = 'Cliente' | 'Fornecedor' | 'ClienteFornecedor';

export interface CadastroContaPayload {
  empresa: {
    nome: string;
    cnpj: string;
    telefone?: string;
  };
  usuario: {
    nome: string;
    email: string;
    senha: string;
    cpf?: string;
  };
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  perfil: { id: number; nome: string; descricao?: string };
  empresa: { id: number; nome: string; cnpj: string; telefone?: string };
  ativo: number;
  perfilUso?: PerfilCadastro;
}

export type CadastroContaResponse = UsuarioLogado;

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  usuario: UsuarioLogado;
}

export interface RecuperarSenhaPayload {
  email: string;
  novaSenha: string;
}

export interface AtualizarUsuarioPayload {
  nome?: string;
  email?: string;
  senha?: string;
}

export interface AtualizarEmpresaPayload {
  nome?: string;
  cnpj?: string;
  telefone?: string;
}

export interface StoredSession {
  token: string;
  usuario: UsuarioLogado;
  expiresAt: number;
}
