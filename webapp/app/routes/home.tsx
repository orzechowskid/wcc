import {
	Outlet
} from "react-router"

import {
	type Route
} from "./+types/home"
import Header from "~/components/Header.tsx"

export async function clientLoader({
	params
}: Route.ClientLoaderArgs) {
	return {
		currentUser: {
			firstName: "Test",
			id: "udeadbeef",
			lastName: "User"
		}
	}
}

export default function Home({
	loaderData
}: Route.ComponentProps) {
	const {
		currentUser
	} = loaderData

	return (
		<>
			<Header currentUser={currentUser} />
			<Outlet />
			<footer />
		</>
	)
}
