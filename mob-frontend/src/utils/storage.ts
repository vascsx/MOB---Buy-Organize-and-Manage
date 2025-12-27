const TOKEN_KEY = 'mob_finance_token';
const USER_KEY = 'mob_finance_user';

/**
 * Salva token JWT no localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retorna token JWT do localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token do localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Salva usuário no localStorage
 */
export const saveUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Retorna usuário do localStorage
 */
export const getUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

/**
 * Remove usuário do localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * Limpa todos os dados do localStorage
 */
export const clearStorage = (): void => {
  removeToken();
  removeUser();
};
