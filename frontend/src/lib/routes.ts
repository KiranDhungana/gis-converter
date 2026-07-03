export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  history: "/history",
  settings: "/settings",
  result: (id: string) => `/results/${id}`,
  api: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    guest: "/api/v1/auth/guest",
  },
} as const;
