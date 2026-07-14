import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        files: ['resources/js/**/*.ts', 'resources/js/**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
            globals: {
                ...globals.browser,
                google: 'readonly',
            },
        },
        rules: {
            'vue/multi-word-component-names': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // Relax formatting rules for shadcn-vue component conventions
            'vue/html-indent': 'off',
            'vue/max-attributes-per-line': 'off',
            'vue/singleline-html-element-content-newline': 'off',
            'vue/html-self-closing': 'off',
            'vue/require-default-prop': 'off',
        },
    },
    {
        files: ['resources/js/**/*.js'],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        ignores: [
            'vendor/',
            'node_modules/',
            'public/',
            'storage/',
            'resources/js/bootstrap.js',
        ],
    },
];
