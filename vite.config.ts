import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only include development plugins in development mode
    ...(mode === 'development' ? [
      // Add development-only plugins here if needed
    ] : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
    // Ensure environment variables are properly defined
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  optimizeDeps: {
    exclude: ['better-sqlite3'],
  },
  build: {
    // Production build optimizations
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
