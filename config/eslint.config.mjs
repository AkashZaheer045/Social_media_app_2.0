import js from '@eslint/js';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        global: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Blob: 'readonly',
        fetch: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        FormData: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        MessageChannel: 'readonly',
        MessagePort: 'readonly',
        structuredClone: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        performance: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        TextDecoder: 'readonly',
        ReadableStream: 'readonly',
        WritableStream: 'readonly',
        TransformStream: 'readonly',
        CompressionStream: 'readonly',
        DecompressionStream: 'readonly',
        navigator: 'readonly',
      },
    },
    rules: {
      // Error Prevention
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'no-constant-condition': 'warn',
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-unreachable': 'warn',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'valid-typeof': 'error',

      // Best Practices
      curly: ['warn', 'multi-line'],
      'default-case': 'warn',
      'dot-notation': 'warn',
      eqeqeq: ['warn', 'smart'],
      'no-caller': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-implied-eval': 'error',
      'no-loop-func': 'warn',
      'no-multi-spaces': 'warn',
      'no-new-wrappers': 'error',
      'no-param-reassign': 'off',
      'no-redeclare': 'error',
      'no-return-await': 'warn',
      'no-self-compare': 'error',
      'no-throw-literal': 'error',
      'no-useless-catch': 'warn',
      'no-useless-return': 'warn',
      'prefer-const': 'warn',
      'require-await': 'warn',
      yoda: 'warn',

      // Style
      'no-mixed-spaces-and-tabs': 'warn',
      'no-trailing-spaces': 'warn',

      // ES6+
      'no-var': 'warn',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'off',
    },
  },
  // Configuration for CommonJS files
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  // Configuration for test files
  {
    files: ['__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
  },
  // Ignore patterns
  {
    ignores: ['node_modules/**', 'coverage/**', '*.min.js'],
  },
];
