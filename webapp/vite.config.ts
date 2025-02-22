import { reactRouter } from "@react-router/dev/vite"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
		babel({
			include: ["./app/**/*"],
			filter: (name: string) => name.endsWith(".tsx"),
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
