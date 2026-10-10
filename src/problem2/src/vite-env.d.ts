interface ImportMetaEnv {
  readonly VITE_PRICES_URL?: string;
  readonly VITE_TOKEN_ICONS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
