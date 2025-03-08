import {
	type RouteConfig,
	layout,
	prefix,
	route
} from "@react-router/dev/routes"

export default [
	layout("routes/_index.tsx", [
		route("/", "routes/index.tsx"),
		route("login", "routes/login.tsx"),
		layout("routes/_auth.tsx", [
			route("me", "routes/me.tsx")
		]),

		...prefix("agenda", [
			route("new", "routes/agenda.new.tsx")
		]),
	]),
	route("auth/google", "routes/auth.google.tsx"),
	route("auth/google/callback", "routes/auth.google.callback.tsx"),
] satisfies RouteConfig
