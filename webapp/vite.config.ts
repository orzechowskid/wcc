import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
		babel({
			babelConfig: {
        babelrc: false,
        configFile: false,
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: process.env.NODE_ENV !== 'production', // Show the display name in devtools when NOT production
              ssr: true,
            },
          ],
          ['@babel/plugin-syntax-jsx', {}],
        ],
        presets: ['@babel/preset-typescript'],
      },
      filter: /\.[jt]sx?$/u,
      loader: 'jsx',
		}),
		reactRouter(),
		tsconfigPaths()
	],
	server: {
		allowedHosts: true,
		hmr: {
			path: "__hmr",
		},
		host: "0.0.0.0"
	}
})
