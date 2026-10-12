import { defineConfig } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';

export default defineConfig(
  ...nextCoreWebVitals,
  ...nextTypeScript,
  prettier,
  {
    plugins: { react },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'react/no-unescaped-entities': 'error',
    },
  },
  {
    files: ['app/admin/(protected)/posts/page.tsx', 'app/admin/verify/page.tsx', 'hooks/use-form.ts'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  {
    files: ['sections/home/ContactSection.tsx'],
    rules: { 'react-hooks/static-components': 'off' },
  }
);
