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

import { getSessionUser } from "~/utils/auth/auth.server"

import Button from "~/components/library/Button.tsx"
import { Heading } from "~/components/Section.tsx"

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
	return redirect("/")
}

const LoginPage = styled.main`
		h1 {
		}

		form {
				display: flex;
				flex-direction: column;
				gap: var(--spacing-form-lg);
		}
`

const StyledHeading = styled(Heading)`

`

const GoogleButton = styled(Button)`
		/* follows Google's design guidelines, not our own */
		font-family: "Roboto";
		font-size: 14px;
		line-height: 20px;
`

export default function Login() {
	const fetcher = useFetcher()

	return (
		<LoginPage>
			<StyledHeading>Welcome</StyledHeading>
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
				<Button type="submit">
					Log in
				</Button>
			</form>
		</LoginPage>
	)
}
