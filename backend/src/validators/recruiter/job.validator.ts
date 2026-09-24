import { z } from "zod";

export const createJobSchema = z.object({
    title: z
        .string()
        .trim()
        .min(2, "Job title must be at least 2 characters")
        .max(150, "Job title is too long"),

    department: z
        .string()
        .trim()
        .max(100, "Department name is too long")
        .optional(),

    location: z
        .string()
        .trim()
        .max(150, "Location is too long")
        .optional(),

    description: z
        .string()
        .trim()
        .min(10, "Job description must be at least 10 characters")
        .max(10000, "Job description is too long"),

    requirements: z
        .array(
            z
                .string()
                .trim()
                .min(1, "Requirement cannot be empty")
                .max(500, "Requirement is too long")
        )
        .default([]),

    questionIds: z
        .array(
            z.string().min(1, "Invalid question ID")
        )
        .default([]),
});


export type CreateJobInput = z.infer<
    typeof createJobSchema
>;