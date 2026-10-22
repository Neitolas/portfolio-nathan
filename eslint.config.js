export default [
  { ignores: ['dist/**', 'node_modules/**', '.npm-cache/**', '.serena/**', 'docs/evidencias/**'] },
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: 'error',
    },
  },
  { files: ['src/main.js'], languageOptions: { globals: { document: 'readonly', window: 'readonly' } } },
  { files: ['src/render.js', 'tests/*.js'], languageOptions: { globals: { URL: 'readonly', structuredClone: 'readonly', document: 'readonly', window: 'readonly', getComputedStyle: 'readonly' } } },
];
