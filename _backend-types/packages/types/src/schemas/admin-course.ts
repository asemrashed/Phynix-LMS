import { z } from "zod"

export const courseLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
export const courseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"])
export const lessonTypeSchema = z.enum(["VIDEO", "TEXT", "QUIZ"])

export const createCourseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  learningOutcomes: z
    .array(z.string().trim().min(1, "Outcome cannot be empty"))
    .max(20, "Maximum 20 learning outcomes")
    .optional(),
  thumbnailUrl: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  originalPrice: z.number().min(0).optional(),
  currency: z.string().optional(),
  level: courseLevelSchema,
  language: z.string().trim().min(2, "Language is required"),
  instructorId: z.string().uuid("Select an instructor"),
})

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: courseStatusSchema.optional(),
  isFeatured: z.boolean().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  originalPrice: z.number().min(0).nullable().optional(),
})

export const videoProviderSchema = z.enum(["VIMEO", "YOUTUBE", "SELF_HOSTED"])

export const createLessonSchema = z.object({
  title: z.string().trim().min(1, "Lesson title is required"),
  type: lessonTypeSchema,
  videoProvider: videoProviderSchema.optional(),
  videoRef: z.string().optional(),
  vimeoId: z.string().optional(),
  content: z.string().optional(),
  duration: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
})

export const updateLessonSchema = createLessonSchema.partial().extend({
  videoRef: z.string().nullable().optional(),
  vimeoId: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
})

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
