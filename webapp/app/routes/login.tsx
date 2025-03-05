import {
    redirect,
    useFetcher,
    type LoaderFunctionArgs
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
import { getSessionUser } from "~/utils/auth/auth.server"

export async function loader({ request }: LoaderFunctionArgs) {
	console.log(request)
	const currentUser = await getSessionUser(request)

	if (currentUser) {
		/* already logged in */
		return redirect("/")
	}
}

export async function action() {
	// TODO
	return redirect("/login")
}

const LoginPage = styled.main`
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		& h1 {
				line-height: 2;
		}

		& form {
				display: flex;
				flex-direction: column;
				gap: var(--spacing-form-lg);
		}
`

const GoogleButton = styled(Button)`
		font-family: "Roboto";
		font-size: 14px;
		line-height: 20px;
`

export default function Login() {
	const fetcher = useFetcher()

	return (
		<LoginPage>
			<h1>Log In</h1>
			<form
				action="/auth/google"
				method="GET"
			>
				<GoogleButton
					preIcon={<img src="/assets/google.svg" />}
					type="submit"
				>
					Sign in with Google
				</GoogleButton>
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
