import { z } from "zod"

export const resolutionStatusesV1 = [
	"ADOPTED",
	"REFERRED",
	"FILED",
	"TABLED",
	"CONFIRMED",
	"ORDAINED",
	"HEARING",
	"ADVERTISED",
	"RECOMMITTED",
	"ACCEPTED",
	"NONE",
	"DENIED"
] as const

export const CcResolutionPredictionValidator = z.object({
	model: z.literal("cc-resolution"),
	modelVersion: z.literal(1),
	result: z.enum(resolutionStatusesV1)
})

export type CcResolutionPrediction = z.infer<typeof CcResolutionPredictionValidator>
