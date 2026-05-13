import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/three_shader_example/',
  plugins: [react()],
});
