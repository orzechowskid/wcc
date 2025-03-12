import {
  useEffect,
  type CSSProperties,
	type HTMLAttributes
} from "react"
import {
	styled
} from "styled-components"

import {
	type Credit
} from "~/types.ts"

import PageHeading from "./PageHeading.tsx"
import {
	useFooter
} from "./Footer.tsx"
import {
	hero
} from "./layouts.tsx"

type HeroImageInfo = {
	attribution: Credit;
	style: CSSProperties
}

const heroImages: Record<string, HeroImageInfo> = {
	bancroftTower: {
		attribution: {
			creator: "Anatoli Lvov",
			creatorLink: "https://commons.wikimedia.org/w/index.php?title=User:Anatoli_Lvov&action=edit&redlink=1",
			license: "CC BY-SA 3.0",
			licenseLink: "https://creativecommons.org/licenses/by-sa/3.0"
		},
		style: {
			backgroundImage: `url('/assets/hero/Bankroft_Tower.jpg')`,
			backgroundPosition: "50% 40%",
			backgroundSize: "cover"
		}
	},
	cityhall: {
		attribution: {
			creator: "Terageorge",
			creatorLink: "https://commons.wikimedia.org/w/index.php?title=User:Terageorge&action=edit&redlink=1",
			license: "CC BY-SA 3.0",
			licenseLink: "https://creativecommons.org/licenses/by-sa/3.0"
		},
		style: {
			backgroundImage: `url('/assets/hero/cityhall.jpeg')`,
			backgroundPosition: "50% 50%",
			backgroundSize: "cover"
		}
	},
	downtown: {
		attribution: {
			creator: "Terageorge",
			creatorLink: "https://commons.wikimedia.org/w/index.php?title=User:Terageorge&action=edit&redlink=1",
			license: "CC BY-SA 3.0",
			licenseLink: "https://creativecommons.org/licenses/by-sa/3.0"
		},
		style: {
			backgroundImage: `url('/assets/hero/Downtown_Worcester,_Massachusetts.jpg')`,
			backgroundPosition: "50% 50%",
			backgroundSize: "cover"
		}
	}
} as const

type HeroProps = HTMLAttributes<HTMLDivElement> & {
	image: keyof typeof heroImages;
	subtitle?: string;
	title: string
}

const StyledHero = styled.div`
		${hero()};

		height: 320px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;

		--blur-index: 1;

		&::after {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: block;
				content: '';
				backdrop-filter: blur(4px) brightness(0.75);
				z-index: var(--blur-index);
		}

		& [data-auto-document-heading] {
				isolation: isolate;
				z-index: calc(var(--blur-index) + 1);
				text-align: center;
				color: var(--color-text-hero);
		}
`

export default function Hero(props: HeroProps) {
	const {
		image,
		subtitle,
		title,
		...rest
	} = props
	const {
		setCredits
	} = useFooter()

	useEffect(() => {
		setCredits((prev) => ({
			...prev,
			hero: heroImages[image].attribution
		}))

		return function cleanup() {
			setCredits((prev) => {
				const {
					hero,
					...rest
				} = prev

				return rest
			})
		}
	}, [image])

	return (
		<StyledHero
			data-hero
			{...rest}
			style={heroImages[image].style}
		>
			<PageHeading>{title}</PageHeading>
		</StyledHero>
	)
}
