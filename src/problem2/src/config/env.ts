function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.`,
    );
  }
  return value;
}

export const env = {
  pricesUrl: required("VITE_PRICES_URL", import.meta.env.VITE_PRICES_URL),
  tokenIconsUrl: required(
    "VITE_TOKEN_ICONS_URL",
    import.meta.env.VITE_TOKEN_ICONS_URL,
  ),
};
