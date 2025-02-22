import {
    redirect,
    useFetcher
} from "react-router"

import {
	type Route
} from "./+types/_auth"
import {
	PasswordInput,
	TextInput
} from "~/components/library/Input"
import {
	styled
} from "styled-components"
import Button from "~/components/library/Button"

export async function clientAction() {
}

const LoginPage = styled.main`
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		& form {
				display: flex;
				flex-direction: column;
				gap: var(--spacing-form-lg);
		}
`

export default function Login({
	loaderData
}: Route.ComponentProps) {
	const fetcher = useFetcher()

	return (
		<LoginPage>
			<h1>Log In</h1>
			<form
				action="/auth/google"
				method="GET"
			>
				<Button type="submit">
					Log in with Google
				</Button>
			</form>
			<div>or</div>
			<form
				action="/auth/form"
				method="POST"
			>
				<TextInput
					autoComplete="username"
					label="username"
					placeholder="janedoe@example.com"
				/>
				<PasswordInput
					autoComplete="current-password"
					label="password"
					placeholder=""
					type="password"
				/>
			</form>
		</LoginPage>
	)
}
