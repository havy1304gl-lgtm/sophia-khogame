import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],define:{__STATIC_LIBRARY__:'true'},build:{outDir:'dist-netlify'},server:{host:'127.0.0.1'}});
