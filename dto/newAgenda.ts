import {
	withZod
} from "@rvf/zod"
import { z } from "zod"


export const NewAgendaValidator = z.object({
	date: z.string().datetime()
})

export const newAgendaFormValidator = withZod(NewAgendaValidator)

export type NewAgendaForm = z.infer<typeof NewAgendaValidator>
