"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLessonSchema = exports.createLessonSchema = exports.videoProviderSchema = exports.updateCourseSchema = exports.createCourseSchema = exports.lessonTypeSchema = exports.courseStatusSchema = exports.courseLevelSchema = void 0;
const zod_1 = require("zod");
exports.courseLevelSchema = zod_1.z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
exports.courseStatusSchema = zod_1.z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
exports.lessonTypeSchema = zod_1.z.enum(["VIDEO", "TEXT", "QUIZ"]);
exports.createCourseSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(3, "Title must be at least 3 characters"),
    slug: zod_1.z
        .string()
        .trim()
        .min(3, "Slug must be at least 3 characters")
        .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
    description: zod_1.z.string().trim().min(10, "Description must be at least 10 characters"),
    learningOutcomes: zod_1.z
        .array(zod_1.z.string().trim().min(1, "Outcome cannot be empty"))
        .max(20, "Maximum 20 learning outcomes")
        .optional(),
    thumbnailUrl: zod_1.z.string().optional(),
    price: zod_1.z.number().min(0, "Price cannot be negative"),
    originalPrice: zod_1.z.number().min(0).optional(),
    currency: zod_1.z.string().optional(),
    level: exports.courseLevelSchema,
    language: zod_1.z.string().trim().min(2, "Language is required"),
    instructorId: zod_1.z.string().uuid("Select an instructor"),
});
exports.updateCourseSchema = exports.createCourseSchema.partial().extend({
    status: exports.courseStatusSchema.optional(),
    isFeatured: zod_1.z.boolean().optional(),
    thumbnailUrl: zod_1.z.string().nullable().optional(),
    originalPrice: zod_1.z.number().min(0).nullable().optional(),
});
exports.videoProviderSchema = zod_1.z.enum(["VIMEO", "YOUTUBE", "SELF_HOSTED"]);
exports.createLessonSchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1, "Lesson title is required"),
    type: exports.lessonTypeSchema,
    videoProvider: exports.videoProviderSchema.optional(),
    videoRef: zod_1.z.string().optional(),
    vimeoId: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(),
    duration: zod_1.z.number().int().min(0).optional(),
    isFree: zod_1.z.boolean().optional(),
});
exports.updateLessonSchema = exports.createLessonSchema.partial().extend({
    videoRef: zod_1.z.string().nullable().optional(),
    vimeoId: zod_1.z.string().nullable().optional(),
    content: zod_1.z.string().nullable().optional(),
});
