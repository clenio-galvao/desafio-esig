// Base URL da API.
// Em produção, pode ser configurado via variável de ambiente NG_APP_API_BASE_URL
// (por exemplo, na Vercel). Em desenvolvimento, cai no fallback localhost.
// const envBaseUrl = (import.meta as any).env?.NG_APP_API_BASE_URL as string | undefined;

export const API_BASE_URL = 'https://desafio-esig-production.up.railway.app/api/v1';
//export const API_BASE_URL = 'http://localhost:8080/api/v1';


export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`
  },
  tasks: {
    root: `${API_BASE_URL}/tasks`
  }
} as const;


