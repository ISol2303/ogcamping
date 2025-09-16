import jwt_decode from "jwt-decode";

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

export const getUserRole = (): string | null => {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr) as { email: string; name: string; role: string };
    return user.role;
  } catch (err) {
    console.error("Invalid user data in localStorage", err);
    return null;
  }
};

