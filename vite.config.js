import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.AI_WORKER_URL;
  return {
    server: target ? { proxy: { '/api': { target, changeOrigin: true, secure: true } } } : undefined
  };
});
