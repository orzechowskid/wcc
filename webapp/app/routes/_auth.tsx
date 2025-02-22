import {
	Outlet,
	redirect
} from "react-router";

import {
	type Route
} from "./+types/_auth";

export async function clientLoader({
	params
}: Route.ClientLoaderArgs) {
	return redirect("/login")
}

export default function Home({
	loaderData
}: Route.ComponentProps) {
	const {
		currentUser
	} = loaderData

	return (
		<>
		</>
	)
}
