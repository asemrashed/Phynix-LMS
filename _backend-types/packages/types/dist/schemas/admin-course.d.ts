import { z } from "zod";
export declare const courseLevelSchema: z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED"]>;
export declare const courseStatusSchema: z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>;
export declare const lessonTypeSchema: z.ZodEnum<["VIDEO", "TEXT", "QUIZ"]>;
export declare const createCourseSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    description: z.ZodString;
    learningOutcomes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    thumbnailUrl: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    originalPrice: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    level: z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED"]>;
    language: z.ZodString;
    instructorId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    slug: string;
    description: string;
    price: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    language: string;
    instructorId: string;
    learningOutcomes?: string[] | undefined;
    thumbnailUrl?: string | undefined;
    originalPrice?: number | undefined;
    currency?: string | undefined;
}, {
    title: string;
    slug: string;
    description: string;
    price: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    language: string;
    instructorId: string;
    learningOutcomes?: string[] | undefined;
    thumbnailUrl?: string | undefined;
    originalPrice?: number | undefined;
    currency?: string | undefined;
}>;
export declare const updateCourseSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    learningOutcomes: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    price: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    level: z.ZodOptional<z.ZodEnum<["BEGINNER", "INTERMEDIATE", "ADVANCED"]>>;
    language: z.ZodOptional<z.ZodString>;
    instructorId: z.ZodOptional<z.ZodString>;
} & {
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    isFeatured: z.ZodOptional<z.ZodBoolean>;
    thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    originalPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    learningOutcomes?: string[] | undefined;
    thumbnailUrl?: string | null | undefined;
    price?: number | undefined;
    originalPrice?: number | null | undefined;
    currency?: string | undefined;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
    language?: string | undefined;
    instructorId?: string | undefined;
    isFeatured?: boolean | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    slug?: string | undefined;
    description?: string | undefined;
    learningOutcomes?: string[] | undefined;
    thumbnailUrl?: string | null | undefined;
    price?: number | undefined;
    originalPrice?: number | null | undefined;
    currency?: string | undefined;
    level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined;
    language?: string | undefined;
    instructorId?: string | undefined;
    isFeatured?: boolean | undefined;
}>;
export declare const videoProviderSchema: z.ZodEnum<["VIMEO", "YOUTUBE", "SELF_HOSTED"]>;
export declare const createLessonSchema: z.ZodObject<{
    title: z.ZodString;
    type: z.ZodEnum<["VIDEO", "TEXT", "QUIZ"]>;
    videoProvider: z.ZodOptional<z.ZodEnum<["VIMEO", "YOUTUBE", "SELF_HOSTED"]>>;
    videoRef: z.ZodOptional<z.ZodString>;
    vimeoId: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    isFree: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "VIDEO" | "TEXT" | "QUIZ";
    title: string;
    videoProvider?: "VIMEO" | "YOUTUBE" | "SELF_HOSTED" | undefined;
    videoRef?: string | undefined;
    vimeoId?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isFree?: boolean | undefined;
}, {
    type: "VIDEO" | "TEXT" | "QUIZ";
    title: string;
    videoProvider?: "VIMEO" | "YOUTUBE" | "SELF_HOSTED" | undefined;
    videoRef?: string | undefined;
    vimeoId?: string | undefined;
    content?: string | undefined;
    duration?: number | undefined;
    isFree?: boolean | undefined;
}>;
export declare const updateLessonSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["VIDEO", "TEXT", "QUIZ"]>>;
    videoProvider: z.ZodOptional<z.ZodOptional<z.ZodEnum<["VIMEO", "YOUTUBE", "SELF_HOSTED"]>>>;
    duration: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isFree: z.ZodOptional<z.ZodOptional<z.ZodBoolean>>;
} & {
    videoRef: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    vimeoId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    content: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type?: "VIDEO" | "TEXT" | "QUIZ" | undefined;
    title?: string | undefined;
    videoProvider?: "VIMEO" | "YOUTUBE" | "SELF_HOSTED" | undefined;
    videoRef?: string | null | undefined;
    vimeoId?: string | null | undefined;
    content?: string | null | undefined;
    duration?: number | undefined;
    isFree?: boolean | undefined;
}, {
    type?: "VIDEO" | "TEXT" | "QUIZ" | undefined;
    title?: string | undefined;
    videoProvider?: "VIMEO" | "YOUTUBE" | "SELF_HOSTED" | undefined;
    videoRef?: string | null | undefined;
    vimeoId?: string | null | undefined;
    content?: string | null | undefined;
    duration?: number | undefined;
    isFree?: boolean | undefined;
}>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
