import {
	type RouteConfig,
	index,
	layout,
	route
} from "@react-router/dev/routes"

export default [
	layout("routes/home.tsx", [
		route("login", "routes/login.tsx"),
		layout("routes/_auth.tsx", [
			route("me", "routes/me.tsx")
		])
	]),
	route("auth/google", "routes/auth.google.tsx"),
	route("auth/google/callback", "routes/auth.google.callback.tsx"),
] satisfies RouteConfig
