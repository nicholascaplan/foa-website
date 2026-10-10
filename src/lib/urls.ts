export const joinBase = (baseUrl: string, path: string) => {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${path}` || "/";
};

export const withBase = (path: string) => joinBase(import.meta.env.BASE_URL, path);
