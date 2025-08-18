// helpers/auth.ts
export const getAuthHeader = (token: string) => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};
