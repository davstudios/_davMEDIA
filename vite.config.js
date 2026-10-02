import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen:false,
  server:{
    strictPort:true,
    port:17440,
    watch:{ignored:['**/src-tauri/**']}
  },
  envPrefix:['VITE_','TAURI_'],
  build:{target:process.env.TAURI_ENV_PLATFORM==='windows'?'chrome105':'safari13',minify:'oxc',sourcemap:!!process.env.TAURI_ENV_DEBUG}
});

