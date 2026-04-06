import type { ESLintConfig } from 'eslint';

const config: ESLintConfig = {
  extends: ['next/core-web-vitals'],
  rules: {
    'react/display-name': 'off',
    '@next/next/no-img-element': 'off',
  },
};

export default config;
