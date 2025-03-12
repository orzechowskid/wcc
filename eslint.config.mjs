// @ts-check

import eslint from '@eslint/js'
import eslintReact from "@eslint-react/eslint-plugin"
import { defineConfig } from "eslint/config"
import jsxa11y from "eslint-plugin-jsx-a11y"
import tseslint from 'typescript-eslint'

export default defineConfig([{
	/* webapp service */

	extends: [
		eslint.configs["recommended"],
		eslintReact.configs["recommended-typescript"],
		tseslint.configs.strict
	],
	files: [
		"webapp/app/**/**.ts",
		"webapp/app/**/*.tsx"
	],
	plugins: {
		"jsx-a11y": jsxa11y
	},
	rules: {
		
	}
}, {
	/* ml service */

	extends: [
		eslint.configs["recommended"]
	],
	files: [
		"ml/**/*.js"
	],
	rules: {
		"no-debugger": [ "warn" ],
	}
}])
