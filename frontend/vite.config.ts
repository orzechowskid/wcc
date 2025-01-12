import { vitePlugin as remix } from "@remix-run/dev"
import { glob } from "glob"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
	server: {
		host: true,
		hmr: {
			path: "__hmr"
		}
	},
	ssr: {
		noExternal: [
      '@adobe/react-spectrum',
      '@react-spectrum/*',
      '@spectrum-icons/*'
		].flatMap((spec) => glob.sync(spec, { cwd: 'node_modules/' }))
	}
})