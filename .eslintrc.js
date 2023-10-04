module.exports = {
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	extends: ['eslint:recommended', 'plugin:prettier/recommended'],
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	rules: {
		// Possible Errors
		'no-console': 'off',
		'no-debugger': 'error',

		// Best Practices
		'consistent-return': 'error',
		'no-else-return': 'error',
		'no-empty-function': 'error',
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-multi-spaces': 'error',
		'no-useless-return': 'error',
		'array-callback-return': 'error',
		'dot-notation': 'error',
		eqeqeq: 'error',
		'no-extend-native': 'error',
		'no-global-assign': 'error',
		'no-loop-func': 'error',
		'no-new-func': 'error',
		'no-control-regex': 'off',
		'no-case-declarations': 'off',
		// Variables
		'no-unused-vars': 'warn',
		'no-shadow': 'error',
		'no-undef': 'error',
		'no-unused-expressions': 'error',

		// Stylistic Issues
		// 'indent': ['error', 'tab'],
		// 'quotes': ['error', 'single'],
		semi: ['error', 'always'],
		'comma-dangle': ['error', 'always-multiline'],
		'brace-style': 'error',
		'array-bracket-spacing': ['error', 'never'],
		'object-curly-spacing': ['error', 'always'],

		// ES6
		'arrow-spacing': 'error',
		'arrow-parens': ['error', 'always'],
		'arrow-body-style': 'error',
		'no-duplicate-imports': 'error',
	},
};
